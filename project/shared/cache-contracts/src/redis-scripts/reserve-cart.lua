local itemCount = tonumber(ARGV[1])
local index = 2
local stockByKey = {}
local userProductUsageByKey = {}
local userPromoUsageByKey = {}

for itemIndex = 1, itemCount do
  local stockKey = ARGV[index]
  local userProductUsageKey = ARGV[index + 1]
  local userPromoUsageKey = ARGV[index + 2]
  local quantity = tonumber(ARGV[index + 3])
  local productLimit = tonumber(ARGV[index + 4])
  local promoLimit = tonumber(ARGV[index + 6])

  if stockByKey[stockKey] == nil then
    stockByKey[stockKey] = tonumber(redis.call('GET', stockKey) or '0')
  end

  stockByKey[stockKey] = stockByKey[stockKey] - quantity
  if stockByKey[stockKey] < 0 then
    return {0, itemIndex, 'OUT_OF_STOCK'}
  end

  if userProductUsageByKey[userProductUsageKey] == nil then
    userProductUsageByKey[userProductUsageKey] = tonumber(redis.call('GET', userProductUsageKey) or '0')
  end

  userProductUsageByKey[userProductUsageKey] = userProductUsageByKey[userProductUsageKey] + quantity
  if userProductUsageByKey[userProductUsageKey] > productLimit then
    return {0, itemIndex, 'PRODUCT_USAGE_LIMIT_EXCEEDED'}
  end

  if userPromoUsageKey ~= '' then
    if userPromoUsageByKey[userPromoUsageKey] == nil then
      userPromoUsageByKey[userPromoUsageKey] = tonumber(redis.call('GET', userPromoUsageKey) or '0')
    end

    userPromoUsageByKey[userPromoUsageKey] = userPromoUsageByKey[userPromoUsageKey] + quantity
    if userPromoUsageByKey[userPromoUsageKey] > promoLimit then
      return {0, itemIndex, 'PROMO_USAGE_LIMIT_EXCEEDED'}
    end
  end

  index = index + 7
end

index = 2

for itemIndex = 1, itemCount do
  local stockKey = ARGV[index]
  local userProductUsageKey = ARGV[index + 1]
  local userPromoUsageKey = ARGV[index + 2]
  local quantity = tonumber(ARGV[index + 3])
  local userProductUsageTtl = tonumber(ARGV[index + 5])

  redis.call('DECRBY', stockKey, quantity)
  redis.call('INCRBY', userProductUsageKey, quantity)

  if userProductUsageTtl and userProductUsageTtl > 0 and redis.call('TTL', userProductUsageKey) == -1 then
    redis.call('EXPIRE', userProductUsageKey, userProductUsageTtl)
  end

  if userPromoUsageKey ~= '' then
    redis.call('INCRBY', userPromoUsageKey, quantity)
  end

  index = index + 7
end

return {1, 0, 'OK'}
