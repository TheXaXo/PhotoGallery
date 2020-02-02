$(document).ready(function() {
    const thumbnailsFolder = "thumbnails/";
    const uncompressedImagesFolder = "photos/";

    const titleTagHexadecimal = 0x5;
    const descriptionTagHexadecimal = 0x78;

    const extractFileNameRegex = /[\w]+?(?=\.)/g;
    const extractExtensionRegex = /\.(jpe?g)$/;

    const limitPerPage = 5;

    const modal = $("#modal");
    const modalImage = $("#modal-content");
    const closeButton = $("span.close");
    const wrapper = $("#wrapper");
    const body = $("body");
    const elementOnBottom = document.getElementById('elementOnBottom');

    const modalOpenClass = "modal-open";

    const observer = new IntersectionObserver(loadMore);

    $(closeButton).on("click", function() {
        closeModal();
    });

    $(window).on("click", function(event) {
        if ($(event.target).is($(modal))) {
            closeModal();
        }
    });

    let thumbnailsOrdered = [];

    $.ajax({
        url: thumbnailsFolder,
        success: function(data) {
            let thumbnailsMap = new Map();

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
            thumbnailsOrdered = Array.from(thumbnailsMapOrdered.values());

            observer.observe(elementOnBottom);
        }
    });

    function loadMore(arr) {
        if (arr[0].isIntersecting) {
            loadThumbnail(0);
        }
    }

    function loadThumbnail(index) {
        if (index >= thumbnailsOrdered.length || index >= limitPerPage) {
            thumbnailsOrdered.splice(0, index);
            return;
        }

        let thumbnail = thumbnailsOrdered[index];
        let uncompressedImage = uncompressedImagesFolder + thumbnail.substring(thumbnail.lastIndexOf('/') + 1);

        loadImage(thumbnail, function(image, data) {
            onThumbnailLoad(image, data, index, uncompressedImage)
        }, {
            meta: true
        });
    }

    function onThumbnailLoad(image, data, index, uncompressedImage) {
        image = $(image).attr("data-src", uncompressedImage).attr("class", "thumbnail").width("20%").height("auto");

        $(image).on("click", function() {
            let uncompressedImage = $(this).attr("data-src");
            $(modal).css("display", "block");
            $(modalImage).attr("src", uncompressedImage);
            $(body).addClass(modalOpenClass);
        });

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
        $(wrapper).append(imageDiv);

        loadThumbnail(index + 1);
    }

    function numericSortDescending(a, b) {
        return b[0] - a[0];
    }

    function closeModal() {
        $(modal).css("display", "none");
        $(body).removeClass(modalOpenClass);
    }
});