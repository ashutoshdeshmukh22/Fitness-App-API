exports.addTime = (previousTime = '0', currentTime) => {
  totalTime = parseInt(previousTime) + parseInt(currentTime);

  return totalTime;
};
