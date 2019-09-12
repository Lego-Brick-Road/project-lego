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
let currentGuess; // current brick classifier has guessed

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  // hide the canvas
  noCanvas();
  // Create a video element
  video = createCapture(VIDEO);
  // Append it to the videoContainer DOM element
  video.parent('videoContainer');

  // Add brick to collection button
  addBrickButton = select('#addBrick');
  addBrickButton.mousePressed(addBrick);

  // delete brick from collection button
  deleteBrickButton = select('#deleteBrick');
  deleteBrickButton.mousePressed(deleteBrick);

  // Minus brick from collection button
  minusBrickButton = select('#minusBrick');
  minusBrickButton.mousePressed(minusBrick);

  // set nav link for collection
  select('#collectionNav').attribute('href', `${window.location.origin}/bricks`);

}

// HELPER FUNCTIONS ===========================

function fetchOptions(fetchMethod) { // fetchMethod = 'POST' || 'DELETE' || 'GET' etc.
  const fetchOptions = {
    method: fetchMethod,
  };
  return fetchOptions;
}

// API CALLS ===========================

function getBrick(){
  const URL = `${window.location.origin}/brick/${currentGuess}`;

  return fetch(URL)
    .then(data=> {return data.json();})
    .then(result=>{
      console.log(result);
      return result;
    })
    .catch(error => console.log(error));
}

function addBrick() {
  const URL = `${window.location.origin}/brick/${currentGuess}`;

  return fetch(URL, fetchOptions('POST'))
    .then(data=> {return data.json();})
    .then(result=>{
      console.log(result);
      return result;
    })
    .catch(error => console.log(error));
}

function minusBrick() {
  const URL = `${window.location.origin}/brick/${currentGuess}`;

  return fetch(URL, fetchOptions('PUT'))
    .then(data=> {return data.json();})
    .then(result=>{
      console.log(result);
      return result;
    })
    .catch(error => console.log(error));
}

function deleteBrick(){
  const URL = `${window.location.origin}/brick/${currentGuess}`;

  return fetch(URL, fetchOptions('DELETE'))
    .then(data=> {return data.json();})
    .then(result=>{
      console.log(result);
      return result;
    })
    .catch(error => console.log(error));
}

// ======================================

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
    // get current best guess
    currentGuess = Object.keys(guesses).reduce((a, b) => guesses[a].average > guesses[b].average ? a : b);
    // fetch best guess brick info from our server
    getBrick()
      .then(brickInfo => {
        // populate html with data
        select('#partName').html(`${brickInfo.name}`);
        select('#partNum').html(`${brickInfo.partNum}`);
        select('#partImage').attribute('src', `${brickInfo.imgUrl}`);
      })
      .catch(error => {
        console.log('getBrick() ERROR', error);
      });
      
    select('#result').html(`${currentGuess}`);
    select('#confidence').html(`${Math.round(guesses[currentGuess].average * 100)} %`);
    console.log(guesses);
    // reset variables
    guesses = {};
    guessCount = 0;
  }else {
    classify();
  }

}


// run classify function when spacebar is pressed
function keyPressed() {
  if(keyCode === 32) {
    console.log('started classifying');
    classify();
  }
  return false; // if you want to prevent any default behaviour
}
