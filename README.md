# Shared Activity Calculator

## Overview
**Shared Activity Calculator** is a simple and efficient solution for tracking and splitting shared expenses among a group.  
This project was inspired by a vacation with friends where individuals purchased items for the group, but not everyone had the same expense-sharing app installed.
At the time, I couldn’t find a suitable tool, so this project was born.

Built with **Google Workspace tools** and a touch of **JavaScript**, this calculator leverages Google Sheets for input/output and data validation, providing an intuitive interface for managing shared expenses.

## Usage
1. Create a copy of the [Spreadsheet template](https://docs.google.com/spreadsheets/d/1QKcwW_eHfX_4K-eRPcXzpjxo68gUna3Sli8mymIhMio/edit?usp=sharing).
2. Enter group members to the Participants sheet.
3. Enter expenses/events which effect at least two members of the group to the Events sheet.
4. Everytime the Events sheet is filled with new information the JavaScript runs automatically.
5. Share the results directly with your group.

## How It Works
1. **I/O**: Participants add their expenses directly into the Google Sheet and get immediat feedback.
2. **Validation**: The sheet uses data validation to ensure inputs are correct and consistent.
3. **Calculation**: The JavaScript logic processes the data to determine balances and generates a summary of settlements.

## Contributions
Contributions, bug reports, and feature requests are welcome! Feel free to submit a pull request or open an issue in the repository.

