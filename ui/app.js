Dropzone.autoDiscover = false;

let uploadedImageData = null;

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "#", // dummy because we won’t use this
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Drop an image or click to upload",
    autoProcessQueue: false,
    previewTemplate: `
    <div class="dz-preview dz-file-preview">
      <div class="dz-image"><img data-dz-thumbnail /></div>
      <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
      <div class="dz-error-message"><span data-dz-errormessage></span></div>
    </div>`,
  });

  dz.on("addedfile", function (file) {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }

    // Save base64 image data
    let reader = new FileReader();
    reader.onload = function (event) {
      uploadedImageData = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  $("#submitBtn").on("click", function () {
    if (!uploadedImageData) {
      alert("Please upload an image first.");
      return;
    }
    const backendURL =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:5000/classify_image" // Local URL (for localhost and 127.0.0.1)
        : "https://fameclassify.onrender.com/classify_image"; // Render URL
    $.post(
      backendURL,
      { image_data: uploadedImageData },
      function (data, status) {
        if (!data || data.length === 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#error").show();
          return;
        }

        let match = null;
        let bestScore = -1;
        for (let i = 0; i < data.length; ++i) {
          let maxScore = Math.max(...data[i].class_probability);
          if (maxScore > bestScore) {
            match = data[i];
            bestScore = maxScore;
          }
        }

        if (match) {
          $("#error").hide();
          $("#resultHolder").show();
          $("#divClassTable").show();
          $("#resultHolder").html(
            `<h3>Matched with: ${match.class}</h3><p>Score: ${bestScore}</p>`
          );

          let classDict = match.class_dictionary;
          for (let personName in classDict) {
            let index = classDict[personName];
            let prob = match.class_probability[index];
            let safeName = personName.replace(/\s+/g, "").replace(/[^\w]/g, "");
            let elementName = "#score_" + safeName;
            $(elementName).html(prob);
          }
        }
      }
    );
  });
}

$(document).ready(function () {
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();
  init();
});
