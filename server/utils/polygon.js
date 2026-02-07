import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const ASSET_SUMMARY_PATH = path.join(process.cwd(), 'asset_summary.csv');
const ASSET_COVARIANCE_PATH = path.join(process.cwd(), 'asset_covariance.csv');

/**
 * Reads asset summary data (mean, volatility) from the summary CSV file.
 * @returns {Promise<Object>} A promise that resolves to an object mapping tickers to their stats.
 */
function readAssetSummary() {
  return new Promise((resolve, reject) => {
    const results = {};
    fs.createReadStream(ASSET_SUMMARY_PATH)
      .pipe(csv())
      .on('data', (data) => {
        results[data.Ticker] = {
          mean: parseFloat(data.Mean),
          vol: parseFloat(data.Volatility),
        };
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

/**
 * Reads the covariance matrix from the CSV file.
 * @returns {Promise<Object>} A promise that resolves to an object with tickers and the covariance matrix.
 */
function readCovarianceMatrix() {
  return new Promise((resolve, reject) => {
    const rows = [];
    let tickers = [];
    
    fs.createReadStream(ASSET_COVARIANCE_PATH)
      .pipe(csv())
      .on('data', (data) => {
        // First column is the ticker name (row label)
        const ticker = data[''];
        if (ticker) {
          tickers.push(ticker);
          const rowValues = Object.keys(data)
            .filter(key => key !== '')
            .map(key => parseFloat(data[key]));
          rows.push(rowValues);
        }
      })
      .on('end', () => {
        resolve({ tickers, matrix: rows });
      })
      .on('error', (error) => reject(error));
  });
}

/**
 * Fetches all necessary market data from local CSV files.
 * @param {string[]} tickers - The tickers to fetch data for.
 * @returns {Promise<Object>} An object containing asset summaries and covariance matrix.
 */
export async function fetchAllMarketData(tickers) {
  try {
    const [summary, covariance] = await Promise.all([
      readAssetSummary(),
      readCovarianceMatrix(),
    ]);

    const filteredSummary = {};
    tickers.forEach(ticker => {
      if (summary[ticker]) {
        filteredSummary[ticker] = summary[ticker];
      }
    });

    return {
      summary: filteredSummary,
      covariance,
    };
  } catch (error) {
    console.error('Failed to read or process asset CSVs:', error);
    throw new Error('Could not load asset data.');
  }
}


