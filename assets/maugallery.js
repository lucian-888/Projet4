(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });
  
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () => 
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () => 
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  
  $.fn.mauGallery.methods = {
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
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage(lightboxId) {
      // Récupérer l'image active dans la lightbox
      let activeImage = $(`#${lightboxId} .lightboxImage`);
    
      // Récupérer le tag actif dans la barre de tags
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
    
      // Initialiser un tableau pour stocker les images
      let imagesCollection = [];
    
      // Vérifier si le tag actif est "all"
      if (activeTag === "all") {
        // Si c'est "all", parcourir toutes les colonnes d'images
        $(".item-column").each(function() {
          // Vérifier si la colonne contient une image
          if ($(this).children("img").length) {
            // Si oui, ajouter l'image au tableau imagesCollection
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        // Sinon, parcourir les colonnes d'images avec le tag actif
        $(".item-column").each(function() {
          // Vérifier si l'image dans la colonne a le tag actif
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            // Si oui, ajouter l'image au tableau imagesCollection
            imagesCollection.push($(this).children("img"));
          }
        });
      }
    
      // Initialiser l'index de l'image active et l'image précédente
      let index = 0, prev = null;
    
      // Parcourir le tableau imagesCollection pour trouver l'index de l'image active
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
    
      // Calculer l'image précédente en utilisant l'index
      prev = imagesCollection[index - 1] || imagesCollection[imagesCollection.length - 1];
    
      // Mettre à jour la source de l'image dans la lightbox avec l'image précédente
      $(`#${lightboxId} .lightboxImage`).attr("src", $(prev).attr("src"));
    },
    
    nextImage(lightboxId) {
      // Récupérer l'image active dans la lightbox
      let activeImage = $(`#${lightboxId} .lightboxImage`);
    
      // Récupérer le tag actif dans la barre de tags
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
    
      // Initialiser un tableau pour stocker les images
      let imagesCollection = [];
    
      // Vérifier si le tag actif est "all"
      if (activeTag === "all") {
        // Si c'est "all", parcourir toutes les colonnes d'images
        $(".item-column").each(function() {
          // Vérifier si la colonne contient une image
          if ($(this).children("img").length) {
            // Si oui, ajouter l'image au tableau imagesCollection
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        // Sinon, parcourir les colonnes d'images avec le tag actif
        $(".item-column").each(function() {
          // Vérifier si l'image dans la colonne a le tag actif
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            // Si oui, ajouter l'image au tableau imagesCollection
            imagesCollection.push($(this).children("img"));
          }
        });
      }
    
      // Initialiser l'index de l'image active et l'image suivante
      let index = 0, next = null;
    
      // Parcourir le tableau imagesCollection pour trouver l'index de l'image active
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
    
      // Calculer l'image suivante en utilisant l'index
      next = imagesCollection[index + 1] || imagesCollection[0];
    
      // Mettre à jour la source de l'image dans la lightbox avec l'image suivante
      $(`#${lightboxId} .lightboxImage`).attr("src", $(next).attr("src"));
    },
    
    
    
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
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
   

    showItemTags(gallery, position, tags) {
      // Initialiser la variable tagItems avec le bouton "Tous" par défaut
      var tagItems = '<li class="nav-item"><span class="nav-link  active-tag" data-images-toggle="all">Tous</span></li>';
    
      // Parcourir chaque tag dans le tableau tags
      $.each(tags, function(index, value) {
        // Ajouter un élément de liste pour chaque tag
        tagItems += `<li class="nav-item">
                <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
    
      // Envelopper les éléments de liste dans une balise <ul>
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
    
      // Déterminer la position des boutons de catégorie
      if (position === "bottom") {
        // Ajouter les boutons de catégorie en bas de la galerie
        gallery.append(tagsRow);
      } else if (position === "top") {
        // Ajouter les boutons de catégorie en haut de la galerie
        gallery.prepend(tagsRow);
      } else {
        // Afficher une erreur si la position n'est pas valide
        console.error(`Unknown tags position: ${position}`);
      }
    },
    
    filterByTag() {
      // Récupérer le tag associé au bouton cliqué
      let tag = $(this).data("images-toggle");
    
      // Supprimer la classe active de tous les boutons
      $(".nav-link").removeClass("active-tag");
      
      // Ajouter la classe active au bouton cliqué
      $(this).addClass("active-tag");
    
      // Vérifier si le tag est "all" (Tous)
      if (tag === "all") {
        // Si c'est "all", afficher toutes les images
        $(".gallery-item").parents(".item-column").show();
      } else {
        // Sinon, cacher toutes les images
        $(".gallery-item").parents(".item-column").hide();
        
        // Afficher uniquement les images avec le tag correspondant
        $(".gallery-item[data-gallery-tag='" + tag + "']").parents(".item-column").show();
      }
    },
    
    
    
    
  };
})(jQuery);
