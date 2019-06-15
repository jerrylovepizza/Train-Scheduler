// RenjieDai Train Scheduler

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAttcXn9H3oAz4Wfpg9Y5Qxinkkzv3qKfs",
    authDomain: "train-scheduler-3fac2.firebaseapp.com",
    databaseURL: "https://train-scheduler-3fac2.firebaseio.com",
    projectId: "train-scheduler-3fac2",
    storageBucket: "",
    messagingSenderId: "357944834422"
};
firebase.initializeApp(config);
var database = firebase.database();

/////////////    TIME    //////////////
var momentDate = moment().format('dddd');
var showDate = $(".date-moment").html('<i class="far fa-calendar-alt"></i> ' + momentDate)

var momentDay = moment().format('LL');
var showDay = $(".day-moment").text(momentDay);

var momentTime = moment().format('LTS');
var showTime = $(".time-moment").text(momentTime);

setInterval(function () {
    $(".time-moment").text(moment().format('LTS'));
}, 1000);

///////////////// FORM /////////////////
// click to submit form
$("#submit-button").on("click", function () {
    event.preventDefault();

    if ($("#train-name").val().trim().length > 0 &&
        $("#train-desti").val().trim().length > 0 &&
        $("#train-freq").val().trim().length > 0) {

        if (parseInt($("#train-hour").val()) >= 0 &&
            parseInt($("#train-hour").val()) < 13 &&
            parseInt($("#train-min").val()) >= 0 &&
            parseInt($("#train-min").val()) < 60 &&
            parseInt($("#train-freq").val()) > 0 &&
            parseInt($("#train-freq").val()) < 1440) {

            var trainName = $("#train-name").val().trim();
            var trainDesti = $("#train-desti").val().trim();
            var trainFreq = $("#train-freq").val().trim();
            var trainStart = $("#train-hour").val().trim() + ":" + $("#train-min").val().trim() + " " + $("#train-ampm").val();

            database.ref().push({
                newName: trainName,
                newDesti: trainDesti,
                newFreq: trainFreq,
                newStart: trainStart,
            });

            $(".form-control").val("");
            $("#train-ampm").val("AM");
            // why not work with empty?
            // $(".form-control").empty();
        } else {
            alert("Please type valid numbers in box")
        }
    } else {
        alert("Please finish the train information before submit");
    }
})

///////////////// TABLE //////////////////
// any changes in firebase child, run the function
database.ref().on("child_added", function (childSnapshot) {
    var trainNamefire = childSnapshot.val().newName;
    var trainDestifire = childSnapshot.val().newDesti;
    var trainFreqfire = childSnapshot.val().newFreq;
    var trainStartfire = childSnapshot.val().newStart;

    // Back day
    var trainStartBackday = moment(trainStartfire, "hh:mm a").subtract(1, "days");
    console.log(trainStartfire)

    // Check different
    var trainMinDiff = moment().diff(trainStartBackday, "minutes")
    console.log(trainMinDiff)

    // minutes away for next train = frequency(total minutes) - remainder(last train have runned minutes)
    var trainNextMins = trainFreqfire - trainMinDiff % trainFreqfire
    console.log(trainNextMins)

    // time when next train arrivaled = now time + minutes away for next train
    var trainArrivalMins = moment().add(trainNextMins, "minutes")
    var trainArrivalTime = trainArrivalMins.format("LT")
    console.log(trainArrivalMins)
    console.log(trainArrivalTime)

    // store keys of firebase
    var key = childSnapshot.key
    console.log(key)

    // remove button
    var removeButton = '<button type="submit" class="btn btn-secondary" id="remove-button" data-key="' + key + '"><i class="fas fa-trash-alt"></i></button>'
    
    // generate new train information
    var newtr = $("<tr>").append(
        $("<td>").text(trainNamefire),
        $("<td>").text(trainDestifire),
        $("<td>").text(trainFreqfire + "-MIN"),
        $("<td>").text(trainArrivalTime),
        $("<td>").text(trainNextMins + " mins"),
        $("<td>").html(removeButton),
    );
    // append new train information to table
    $(".table-body").append(newtr)
})

$(document).on("click", "#remove-button", function () {
    var trainConfirm = prompt("Please enter the PIN to remove the train:")
    // if (trainConfirm === "isaac") {
        database.ref().child($(this).attr("data-key")).remove();
        $(this).parentsUntil("tbody").remove();
    //     alert("The train has been removed.");
    // } else {
    //     alert("The password is invalid.");
    // }
})