const hourAgo = new Date(Date.now() - (60 * 60) * 1000);
const now = new Date();
const test = new Date(Date.now() - 31536000 * 1000);

console.log(hourAgo);
console.log(now);
console.log(test);