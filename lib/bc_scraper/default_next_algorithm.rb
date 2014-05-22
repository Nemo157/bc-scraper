module BandcampScraper
  class DefaultNextAlgorithm
    def process current, queue
      if queue.length < 50
        queue.concat current.linked.select { |linked| not linked.parsed }
      end
      if queue.length < 5
        queue.concat current.linked.shuffle.take(5)
      end
    end
  end
end
