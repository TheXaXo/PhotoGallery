const thumbnailsFolder = "thumbnails/";
const uncompressedImagesFolder = "photos/";

const titleTagHexadecimal = 0x5;
const descriptionTagHexadecimal = 0x78;

const extractFileNameRegex = /[\w]+?(?=\.)/g;
const extractExtensionRegex = /\.(jpe?g)$/;

let thumbnailsMap = new Map();

$.ajax({
    url: thumbnailsFolder,
    success: function(data) {
        $(data).find("a").attr("href", function(i, thumbnail) {
            if (thumbnail.match(extractExtensionRegex)) {
                let matchesArray = thumbnail.match(extractFileNameRegex);

                if (matchesArray == null) {
                    return;
                }

                let thumbnailNameAsNumber = Number(matchesArray[0]);

                if (isNaN(thumbnailNameAsNumber)) {
                    return;
                }

                thumbnailsMap.set(thumbnailNameAsNumber, thumbnail);
            }
        });

        let thumbnailsMapOrdered = new Map([...thumbnailsMap].sort(numericSortDescending));
        let thumbnailsOrdered = Array.from(thumbnailsMapOrdered.values());

        loadThumbnail(thumbnailsOrdered, 0);
    }
});

function loadThumbnail(thumbnails, index) {
    if (index >= thumbnails.length) {
        return;
    }

    let thumbnail = thumbnails[index];
    let uncompressedImage = uncompressedImagesFolder + thumbnail.substring(thumbnail.lastIndexOf('/') + 1);

    loadImage(thumbnail, function(image, data) {
        onThumbnailLoad(image, data, thumbnails, index, uncompressedImage)
    }, {
        meta: true
    });
}

function onThumbnailLoad(image, data, thumbnails, index, uncompressedImage) {
    image = $(image).attr("data-src", uncompressedImage).width("20%").height("auto");

    let title = "No Title";
    let description = "No Description";

    if (data.iptc) {
        title = data.iptc[titleTagHexadecimal];
        description = data.iptc[descriptionTagHexadecimal];
    }

    let imageDiv = $("<div>");
    let imageTitle = $("<h1>").text(title);
    let imageDescription = $("<h3>").text(description);

    $(imageDiv).append(imageTitle).append(imageDescription).append(image);
    $("body").append(imageDiv);

    loadThumbnail(thumbnails, index + 1);
}

function numericSortDescending(a, b) {
    return b[0] - a[0];
}