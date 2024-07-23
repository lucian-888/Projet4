(function($) {
  // Définition du plugin jQuery
  $.fn.mauGallery = function(options) {
    // Fusion des options par défaut avec celles spécifiées par l'utilisateur
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = []; // Collection de tags uniques
    return this.each(function() {
      // Création du conteneur de lignes pour les éléments de la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));
      
      // Si l'option lightBox est activée, créer une lightbox
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      // Initialisation des écouteurs d'événements
      $.fn.mauGallery.listeners(options);

      // Pour chaque élément de la galerie
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          // Rendre les images réactives
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          // Déplacer l'élément dans le conteneur de lignes
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          // Envelopper l'élément dans une colonne en fonction des options de colonnes
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          // Récupérer le tag de l'élément
          var theTag = $(this).data("gallery-tag");
          // Si les tags doivent être affichés et que le tag est nouveau, l'ajouter à la collection
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      // Si les tags doivent être affichés, les afficher
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      // Afficher la galerie avec un effet de fondu
      $(this).fadeIn(500);
    });
  };

  // Options par défaut du plugin
  $.fn.mauGallery.defaults = {
    columns: 3, // Nombre de colonnes par défaut
    lightBox: true, // Activation de la lightbox par défaut
    lightboxId: null, // ID de la lightbox
    showTags: true, // Afficher les tags par défaut
    tagsPosition: "bottom", // Position des tags par défaut
    navigation: true // Navigation activée par défaut
  };

  // Écouteurs d'événements pour les interactions utilisateur
  $.fn.mauGallery.listeners = function(options) {
    // Lorsqu'un élément de la galerie est cliqué
    $(".gallery-item").on("click", function() {
      // Si la lightbox est activée et que l'élément cliqué est une image, ouvrir la lightbox
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Filtrer les images par tag lorsque l'utilisateur clique sur un tag
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    // Navigation vers l'image précédente dans la lightbox
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    // Navigation vers l'image suivante dans la lightbox
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  // Méthodes du plugin
  $.fn.mauGallery.methods = {
    // Création du conteneur de lignes pour les éléments de la galerie
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    // Envelopper l'élément dans une colonne en fonction des options de colonnes
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    // Déplacer l'élément dans le conteneur de lignes
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    // Rendre les images réactives
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    // Ouvrir la lightbox pour l'image cliquée
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    // Navigation vers l'image précédente dans la lightbox
    prevImage(lightboxId) {
      let activeImage = $(`#${lightboxId} .lightboxImage`);
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];

      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      let index = 0, prev = null;
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      prev = imagesCollection[index - 1] || imagesCollection[imagesCollection.length - 1];
      $(`#${lightboxId} .lightboxImage`).attr("src", $(prev).attr("src"));
    },
    // Navigation vers l'image suivante dans la lightbox
    nextImage(lightboxId) {
      let activeImage = $(`#${lightboxId} .lightboxImage`);
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];

      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      let index = 0, next = null;
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      next = imagesCollection[index + 1] || imagesCollection[0];
      $(`#${lightboxId} .lightboxImage`).attr("src", $(next).attr("src"));
    },
    // Création de la lightbox
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-labelledby="${lightboxId}-label" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    // Affichage des tags des éléments
    showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link  active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item">
                <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    // Filtrer les éléments par tag
    filterByTag() {
      let tag = $(this).data("images-toggle");
      $(".nav-link").removeClass("active-tag");
      $(this).addClass("active-tag");

      if (tag === "all") {
        $(".gallery-item").parents(".item-column").show();
      } else {
        $(".gallery-item").parents(".item-column").hide();
        $(".gallery-item[data-gallery-tag='" + tag + "']").parents(".item-column").show();
      }
    },
  };
})(jQuery);
