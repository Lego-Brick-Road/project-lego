// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
KNN Classification on Webcam Images with mobileNet. Built with p5.js
=== */

/* eslint no-undef: 0 */

let video;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;
let brickIdInput;
let guesses = {}; // local object storing classifiers confidence levels for each object.
let guessCount = 0; // how many video frames has classifier tried to classify so far
let confidenceThreshold = 0.75; // how confident does the classifier need to be before giving result

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  // hide the canvas
  noCanvas();
  // Create a video element
  video = createCapture(VIDEO);
  // Append it to the videoContainer DOM element
  video.parent('videoContainer');
}

function modelReady(){
  select('#ModelStatus').html('FeatureExtractor(mobileNet model) Loaded');

  // load our classifier
  knnClassifier.load('./myKNNDataset.json', () => {
    select('#ClassifierStatus').html('Brick Lego Classifer Loaded');
  });
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Use knnClassifier to classify which label do these features belong to
  knnClassifier.classify(features, gotResults);
}

// store results in guesses object until confidence threshold is met
function gotResults(err, result) {
  let confidentFlag = false;

  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    guessCount ++;

    // add new ML confidences to our guesses object
    Object.keys(confidences).forEach(label => {
      if(guesses[label]) {
        guesses[label].total = guesses[label].total + confidences[label];
      } else {
        guesses[label] = {total: confidences[label]};
      }
    });

    // compute new average for every guess
    Object.keys(guesses).forEach(label => {
      guesses[label].average = guesses[label].total / guessCount;
      if (guesses[label].average > confidenceThreshold) {confidentFlag = true;}
    });

  }
  // after 10 guesses finish
  if((guessCount > 50 && confidentFlag) || guessCount > 200 ) {
    console.log(getGreatestGuess());
    // select('#result').html('FeatureExtractor(mobileNet model) Loaded');
    // select('#confidence').html('FeatureExtractor(mobileNet model) Loaded');
    console.log(guesses);
    guesses = {};
    guessCount = 0;
  }else {
    classify();
  }

}

function getGreatestGuess(){
  return Object.keys(guesses).reduce((a, b) => obj[a].average > obj[b].average ? a : b);
}
// run classify function when spacebar is pressed
function keyPressed() {
  if(keyCode === 32) {
    console.log('started classifying');
    classify();
  }
  return false; // if you want to prevent any default behaviour
}