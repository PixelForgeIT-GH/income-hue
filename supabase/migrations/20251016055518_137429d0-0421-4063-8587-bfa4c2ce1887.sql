-- Add column to track which accounts should be displayed on dashboard
ALTER TABLE plaid_accounts 
ADD COLUMN show_on_dashboard boolean NOT NULL DEFAULT true;