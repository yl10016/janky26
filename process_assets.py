import os
import pandas as pd
import numpy as np

def process_asset_data(assets_folder, summary_output_file, covariance_output_file):
    """
    Processes asset CSV files to calculate annualized mean return, volatility,
    and the covariance matrix.

    Args:
        assets_folder (str): Path to the folder with asset CSVs.
        summary_output_file (str): Path for the output summary CSV.
        covariance_output_file (str): Path for the output covariance CSV.
    """
    all_returns = {}
    asset_files = [f for f in os.listdir(assets_folder) if f.endswith('.csv')]
    trading_days = 252
    min_history_days = 1260  # Require at least 5 years of data (252 * 5)

    for asset_file in asset_files:
        ticker = asset_file.split('_')[0].upper()
        file_path = os.path.join(assets_folder, asset_file)
        
        try:
            df = pd.read_csv(file_path, index_col='Date', parse_dates=True)
            if 'Close' not in df.columns:
                continue
            
            # Skip assets with insufficient history
            if len(df) < min_history_days:
                print(f"Skipping {ticker}: only {len(df)} days (need {min_history_days})")
                continue
                
            # Use log returns for proper statistical properties and annualization
            daily_returns = np.log(df['Close'] / df['Close'].shift(1)).dropna()
            all_returns[ticker] = daily_returns
        except Exception as e:
            print(f"Error processing {asset_file}: {e}")

    if not all_returns:
        print("No data to process.")
        return

    # Combine all returns into a single DataFrame, aligning by date
    returns_df = pd.DataFrame(all_returns).dropna()

    # Calculate summary stats (mean return, volatility)
    mean_returns = returns_df.mean() * trading_days
    volatility = returns_df.std() * np.sqrt(trading_days)
    
    # Apply Bayesian shrinkage toward market mean to reduce overfitting
    # Use adaptive shrinkage: assets with extreme Sharpe ratios get shrunk more
    if 'SPY' in returns_df.columns:
        market_return = returns_df['SPY'].mean() * trading_days
        market_vol = returns_df['SPY'].std() * np.sqrt(trading_days)
        market_sharpe = market_return / market_vol
    else:
        market_return = mean_returns.mean()
        market_sharpe = 0.7
    
    # Calculate Sharpe ratios
    sharpe_ratios = mean_returns / volatility
    
    # Adaptive shrinkage: stronger for assets with Sharpe > 1.5x market
    # tau = weight on historical return (lower tau = more shrinkage toward market)
    tau = np.where(
        sharpe_ratios > 1.5 * market_sharpe,
        0.20,  # Only 20% weight on historical for very high Sharpe (80% toward market)
        0.40   # 40% weight on historical for normal assets (60% toward market)
    )
    
    shrunken_returns = (1 - tau) * market_return + tau * mean_returns
    
    summary_df = pd.DataFrame({
        'Ticker': returns_df.columns,
        'Mean': shrunken_returns.values,
        'Volatility': volatility.values
    })
    summary_df.to_csv(summary_output_file, index=False)
    print(f"Successfully saved asset summary to {summary_output_file}")

    # Calculate and save the covariance matrix
    covariance_matrix = returns_df.cov() * trading_days
    covariance_matrix.to_csv(covariance_output_file)
    print(f"Successfully saved covariance matrix to {covariance_output_file}")


if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    assets_folder = os.path.join(current_dir, 'assets')
    summary_output = os.path.join(current_dir, 'asset_summary.csv')
    covariance_output = os.path.join(current_dir, 'asset_covariance.csv')
    
    process_asset_data(assets_folder, summary_output, covariance_output)


