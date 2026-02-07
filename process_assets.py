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

    for asset_file in asset_files:
        ticker = asset_file.split('_')[0].upper()
        file_path = os.path.join(assets_folder, asset_file)
        
        try:
            df = pd.read_csv(file_path, index_col='Date', parse_dates=True)
            if 'Close' not in df.columns:
                continue
            daily_returns = df['Close'].pct_change().dropna()
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
    
    summary_df = pd.DataFrame({
        'Ticker': returns_df.columns,
        'Mean': mean_returns.values,
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


