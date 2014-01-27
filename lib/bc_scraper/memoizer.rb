module BandcampScraper
  module Memoizer
    def memoized attribute, &block
      var_name = "@#{attribute}"
      define_method attribute do
        var = instance_variable_get var_name
        if var == nil
          var = instance_exec(&block)
          instance_variable_set var_name, var
        end
        var
      end
    end
  end
end
