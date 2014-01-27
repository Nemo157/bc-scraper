require 'sinatra/base'
require 'sinatra/json'

require_relative 'user'
require_relative 'album'

module BandcampScraper
  class App < Sinatra::Base
    set :root, File.realpath('../../', File.dirname(__FILE__))
    enable :logging

    get '/' do
      haml :index, format: :html5
    end

    get '/users/*' do |uri|
      json User.new("http://#{uri}").load!.to_hash(true)
    end

    get '/albums/*' do |uri|
      json Album.new("http://#{uri}").load!.to_hash(true)
    end
  end
end
