require 'aws-sdk'
AWS.config access_key_id: ENV['aws_access_key_id'], secret_access_key: ENV['aws_secret_access_key'], region: 'us-east-1'

require './lib/bc_scraper/app'
run BandcampScraper::App
