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
let guesses = {};
let guessCount = 0;

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  noCanvas();
  // Create a video element
  video = createCapture(VIDEO);
  // Append it to the videoContainer DOM element
  video.parent('videoContainer');
  // Create the UI buttons
  createButtons();
}

function modelReady(){
  select('#status').html('FeatureExtractor(mobileNet model) Loaded');
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Get the features of the input video
  const features = featureExtractor.infer(video);
  // You can also pass in an optional endpoint, defaut to 'conv_preds'
  // const features = featureExtractor.infer(video, 'conv_preds');
  // You can list all the endpoints by calling the following function
  // console.log('All endpoints: ', featureExtractor.mobilenet.endpoints)

  // Add an example with a label to the classifier
  knnClassifier.addExample(features, label);
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
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(features, gotResults);
  // You can also pass in an optional K value, K default to 3
  // knnClassifier.classify(features, 3, gotResults);

  // You can also use the following async/await function to call knnClassifier.classify
  // Remember to add `async` before `function predictClass()`
  // const res = await knnClassifier.classify(features);
  // gotResults(null, res);
}

// A util function to create UI buttons
function createButtons() {

  brickIdInput = select('#brickID');

  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);

  // Load saved classifier dataset
  buttonSetData = select('#load');
  buttonSetData.mousePressed(loadMyKNN);

  // Get classifier dataset
  buttonGetData = select('#save');
  buttonGetData.mousePressed(saveMyKNN);
}

// Show the results
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
      if (guesses[label].average > 0.80) {
        confidentFlag = true;
      }
    });

  }
  // after 10 guesses finish
  if(guessCount > 50 && confidentFlag){
    console.log(guesses);
    guesses = {};
    guessCount = 0;
  }else {
    classify();
  }

}

// Update the example count for each label	
function logExampleCounts() {
  console.log(knnClassifier.getCountByLabel());
}

// Clear the examples in one label
function clearLabel(label) {
  knnClassifier.clearLabel(label);
  updateCounts();
}


// Save dataset as myKNNDataset.json
function saveMyKNN() {
  knnClassifier.save('myKNNDataset');
}

// Load dataset to the classifier
function loadMyKNN() {
  knnClassifier.load('./myKNNDataset.json', updateCounts);
}

// runs whenever a key is pressed
function keyPressed() {
  if(keyCode === 189) {
    console.log(`clear label: ${brickIdInput.elt.value}`);
    clearLabel(brickIdInput.elt.value);
  }
  // return false; // prevent any default behaviour
}


function draw(){
  // check if '=' key is pressed and train add the current frame
  // from the video with a label from brickIdInput to the classifier
  if(keyIsDown(187)){
    console.log(`training label: ${brickIdInput.elt.value}`);
    addExample(brickIdInput.elt.value);
  }
}
