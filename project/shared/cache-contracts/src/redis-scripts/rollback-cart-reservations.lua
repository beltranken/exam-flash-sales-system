local itemCount = tonumber(ARGV[1])
local index = 2

for itemIndex = 1, itemCount do
  local stockKey = ARGV[index]
  local userProductUsageKey = ARGV[index + 1]
  local userPromoUsageKey = ARGV[index + 2]
  local quantity = tonumber(ARGV[index + 3])

  redis.call('INCRBY', stockKey, quantity)
  redis.call('DECRBY', userProductUsageKey, quantity)

  if userPromoUsageKey ~= '' then
    redis.call('DECRBY', userPromoUsageKey, quantity)
  end

  index = index + 7
end

return {1, 0, 'OK'}
