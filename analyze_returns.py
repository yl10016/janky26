import pandas as pd
import numpy as np

# Check SLV and GDX
for ticker_file in ['slv_us_d.csv', 'gdx.csv']:
    ticker = ticker_file.split('_')[0].upper().split('.')[0]
    df = pd.read_csv(f'assets/{ticker_file}', index_col='Date', parse_dates=True)
    
    simple_returns = df['Close'].pct_change().dropna()
    log_returns = np.log(df['Close'] / df['Close'].shift(1)).dropna()
    
    print(f'\n{ticker} Analysis:')
    print(f'Data points: {len(simple_returns)}')
    print(f'Date range: {df.index[0]} to {df.index[-1]}')
    
    print(f'\nSimple returns (WRONG METHOD):')
    print(f'  Daily mean: {simple_returns.mean():.6f}')
    print(f'  Annualized (x252): {simple_returns.mean() * 252:.4f} = {simple_returns.mean() * 252 * 100:.2f}%')
    
    print(f'\nLog returns (CORRECT METHOD):')
    print(f'  Daily mean: {log_returns.mean():.6f}')
    print(f'  Annualized (x252): {log_returns.mean() * 252:.4f} = {log_returns.mean() * 252 * 100:.2f}%')
    
    print(f'\nActual performance:')
    total_return = (df['Close'].iloc[-1] / df['Close'].iloc[0]) - 1
    years = len(df) / 252
    cagr = (1 + total_return) ** (1/years) - 1
    print(f'  Total return: {total_return * 100:.2f}% over {years:.1f} years')
    print(f'  CAGR: {cagr * 100:.2f}%')
    print('='*60)
