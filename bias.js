import Client, { HTTP } from 'drand-client'
import fetch from 'node-fetch'
import AbortController from 'abort-controller'

global.fetch = fetch
global.AbortController = AbortController
const HEX = 16;
const FoodOptions = { "pho": 0.3, "croquets": 0.29, "pizza": 0.28, "pasta": 0.07, "mole_verde": 0.03, "shrimp": .03 }

const chainHash = '8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce' // (hex encoded)
const urls = [
  'https://api.drand.sh',
  'https://drand.cloudflare.com'
]
/*
  Example: Imagine you are a full time L5 software engineer and have more important things to think about than what to get for lunch.
          You decide to leave it up to randomness to choose your next meal. But you still have preferences.
          You assign weights to your preferences such that items you would like to eat most often have heavier weights (chances of being chosen)
          And things you don't want to eat as often, have smaller probability of being chosen.
*/

// This function takes in a list of items and the probablilty of them being selected.
//    returns the number that is randomly selected 
async function weightedRandom(prob) {

  const options = { chainHash }

  const client = await Client.wrap(HTTP.forURLs(urls, chainHash), options)

  // e.g. use the client to get the latest randomness round:
  const res = await client.get()
  // console.log(res.round, res.randomness)

  // assign randomness value as a string to a variable
  const randomness = res.randomness

  // grab the left most 12 digits
  const drand = randomness.slice(0, 12)
  // console.log("drand", drand)

  // Convert hexadecimal randomness value to decimal (base16 -> base10)
  var base10 = parseInt(drand, HEX)
  // console.log("base10", base10)

  // "normalize" rand value to be a percentage (between 0-1)
  var normal = base10
  while (normal > 1){
    normal /= 10;
  }
  console.log("normalize", parseFloat(normal.toFixed(8)))

  // This for loop selects which key:pair to return
  let sum = 0, r = parseFloat(normal.toFixed(8));
  for (let [key, value] of Object.entries(prob)) {
    sum += value;
    if (r <= sum) {
      return key;
    }
  }
}

//runs code above
weightedRandom(FoodOptions).then((lunch) => (console.log(lunch)))
// Press Ctrl + C to stop example!

/* Things to note:
    Drand mainnet releases a random number every 30 seconds. The problem that arises is if you want to test if the biased randomness works or not, it would take a really long time to test.
    There is work to shorten this time frame to 3 seconds, which is better, but its not as convenient as instant access of psuedo-random numbers like math.random() or crypto.getRandomValues().

    This "biased" algo is not sophisticated, weights are not changing every iteration to actively control supply.
    Ideally, we have a neural net that adjusts weights in order to control supply ratio.
    Or some other algorithm that handled weights better, instead of just summation of key:pair values.
*/