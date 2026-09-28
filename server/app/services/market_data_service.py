"""
Fetches raw candle (OHLCV) data from Binance via CCXT.

Important: this is PUBLIC market data -- no API key needed at all.
That's deliberate: charting/indicators should work for every logged-in
user regardless of whether they've connected their own Binance account.
Binance keys are only needed later, for the user's personal PORTFOLIO
(services/binance_service.py), which is a completely separate concern.
"""

import asyncio
import time
import httpx
import ccxt.async_support as ccxt_async


_candle_cache: dict[tuple[str, str], tuple[float, list[list[float]]]] = {}
_candle_in_flight: dict[tuple[str, str], asyncio.Task] = {}
CANDLE_CACHE_TTL = 15.0  # seconds

_price_cache: dict[str, tuple[float, float]] = {}
PRICE_CACHE_TTL = 30.0  # seconds


def _to_ccxt_symbol(symbol: str) -> str:
    """
    Our chart_context stores symbols as 'BTCUSDT' (no separator), matching
    Binance's raw REST format. CCXT's unified API expects 'BTC/USDT' --
    so we convert only at this boundary, keeping the rest of the app
    consistent with the Binance-style format.
    """
    if "/" in symbol:
        return symbol
    # crude but effective for the common quote assets we care about
    for quote in ("USDT", "BUSD", "USDC", "BTC", "ETH"):
        if symbol.endswith(quote) and len(symbol) > len(quote):
            return f"{symbol[:-len(quote)]}/{quote}"
    return symbol


async def _do_fetch_ohlcv(ccxt_symbol: str, timeframe: str, limit: int) -> list[list[float]]:
    exchange = ccxt_async.binance()
    try:
        candles = await exchange.fetch_ohlcv(ccxt_symbol, timeframe=timeframe, limit=limit)
        return candles
    finally:
        await exchange.close()  # always release the underlying aiohttp session


async def fetch_ohlcv(symbol: str, timeframe: str, limit: int = 200) -> list[list[float]]:
    """
    Returns a list of [timestamp_ms, open, high, low, close, volume].
    Uses in-flight deduplication and a 15-second TTL cache so parallel requests
    (e.g. market_analysis_node and risk_node) share the same underlying network call.
    """
    ccxt_symbol = _to_ccxt_symbol(symbol)
    cache_key = (ccxt_symbol, timeframe)
    now = time.time()

    # 1. Return from fresh cache if available and has enough candles
    if cache_key in _candle_cache:
        cached_time, candles = _candle_cache[cache_key]
        if (now - cached_time) < CANDLE_CACHE_TTL and len(candles) >= limit:
            return candles[-limit:]

    # 2. Join in-flight request if another coroutine is already fetching this symbol/timeframe
    if cache_key in _candle_in_flight:
        candles = await _candle_in_flight[cache_key]
        return candles[-limit:]

    # 3. Dispatch new fetch -- pull at least 200 candles so concurrent consumers with smaller limits can share
    fetch_limit = max(limit, 200)
    task = asyncio.create_task(_do_fetch_ohlcv(ccxt_symbol, timeframe, fetch_limit))
    _candle_in_flight[cache_key] = task

    try:
        candles = await task
        _candle_cache[cache_key] = (time.time(), candles)
        return candles[-limit:]
    finally:
        _candle_in_flight.pop(cache_key, None)


async def fetch_prices_in_usdt(assets: list[str]) -> dict[str, float]:
    """
    Fetches current prices for a list of assets in USDT in a single batch call.
    Results are cached in memory for 30s to eliminate redundant ticker requests.
    """
    now = time.time()
    result: dict[str, float] = {}
    missing: list[str] = []

    for a in assets:
        ua = a.upper()
        if ua in ("USDT", "USDC", "BUSD", "DAI", "FDUSD"):
            result[a] = 1.0
        elif ua in _price_cache and (now - _price_cache[ua][0]) < PRICE_CACHE_TTL:
            result[a] = _price_cache[ua][1]
        else:
            missing.append(ua)

    if missing:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get("https://api.binance.com/api/v3/ticker/price")
                if resp.status_code == 200:
                    data = resp.json()
                    lookup = {item["symbol"]: float(item["price"]) for item in data}
                    for ua in missing:
                        price = lookup.get(f"{ua}USDT", 0.0)
                        _price_cache[ua] = (now, price)
                        result[ua] = price
        except Exception:
            for ua in missing:
                result[ua] = _price_cache.get(ua, (0, 0.0))[1]

    for a in assets:
        if a not in result:
            result[a] = result.get(a.upper(), 0.0)

    return result


async def fetch_price_in_usdt(asset: str) -> float:
    """
    Returns the current price of a single asset in USDT -- used by the
    risk service to value portfolio holdings.
    """
    prices = await fetch_prices_in_usdt([asset])
    return prices.get(asset, 0.0)