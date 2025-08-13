// async "wait" function 
export const asyncTimeout = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


// retry mechanism - use to wrap function calls in the main function
// args are arguments used when a certain function is called - so the function is called as originally intented
// attempt 0 is the initial function call
export const retry = async (fn, fnName, options = {}, ...args) => {
  const { maxAttempts = 5, delayMs = 1000 } = options; // object destructuring with default values - if not provided in the retry call
  let attempt = 0;

  while (attempt <= maxAttempts) {
    try {
      // console.log(`Executing attempt ${attempt}`);
      return await fn(...args);
    } catch (err) {
      const delay = delayMs * (2 ** attempt);
      if (attempt < maxAttempts) {
        console.log(`Error in '${fnName}' - ${err.message}. Retry attempt ${attempt + 1} with ${delay}ms delay.`);
        await asyncTimeout(delay);
      } else {
        console.log(`All attempts failed.`);
      };
    }
    attempt++;
  };
};


export const randomNumber = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};