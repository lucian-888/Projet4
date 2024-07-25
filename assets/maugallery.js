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
      // Sélectionne l'image actuellement affichée dans la lightbox en utilisant l'ID de la lightbox
      let activeImage = $(`#${lightboxId} .lightboxImage`);
  
      // Récupère le tag actif (filtre) dans la barre des tags pour déterminer quelles images afficher
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
  
      // Initialise un tableau pour stocker la collection d'images à afficher
      let imagesCollection = [];
  
      // Si le tag actif est "all", inclut toutes les images dans la collection
      if (activeTag === "all") {
          $(".item-column").each(function() {
              // Si l'élément contient une image, l'ajoute à la collection
              if ($(this).children("img").length) {
                  imagesCollection.push($(this).children("img"));
              }
          });
      } else {
          // Si un tag spécifique est actif, inclut uniquement les images avec ce tag dans la collection
          $(".item-column").each(function() {
              if ($(this).children("img").data("gallery-tag") === activeTag) {
                  imagesCollection.push($(this).children("img"));
              }
          });
      }
  
      // Initialisation des variables pour l'index de l'image actuelle et l'image précédente
      let index = 0, prev = null;
  
      // Parcourt la collection d'images pour trouver l'index de l'image actuellement affichée
      $(imagesCollection).each(function(i) {
          if ($(activeImage).attr("src") === $(this).attr("src")) {
              index = i;
          }
      });
  
      // Détermine l'image précédente dans la collection
      // Si l'image actuelle est la première de la collection, prend la dernière image comme précédente
      prev = imagesCollection[index - 1] || imagesCollection[imagesCollection.length - 1];
  
      // Met à jour l'attribut "src" de l'image dans la lightbox pour afficher l'image précédente
      $(`#${lightboxId} .lightboxImage`).attr("src", $(prev).attr("src"));
  },
  
    // Navigation vers l'image suivante dans la lightbox
    nextImage(lightboxId) {
      // Sélectionne l'image actuellement affichée dans la lightbox en utilisant l'ID de la lightbox
      let activeImage = $(`#${lightboxId} .lightboxImage`);
  
      // Récupère le tag actif (filtre) dans la barre des tags pour déterminer quelles images afficher
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
  
      // Initialise un tableau pour stocker la collection d'images à afficher
      let imagesCollection = [];
  
      // Si le tag actif est "all", inclut toutes les images dans la collection
      if (activeTag === "all") {
          $(".item-column").each(function() {
              // Si l'élément contient une image, l'ajoute à la collection
              if ($(this).children("img").length) {
                  imagesCollection.push($(this).children("img"));
              }
          });
      } else {
          // Si un tag spécifique est actif, inclut uniquement les images avec ce tag dans la collection
          $(".item-column").each(function() {
              if ($(this).children("img").data("gallery-tag") === activeTag) {
                  imagesCollection.push($(this).children("img"));
              }
          });
      }
  
      // Initialisation des variables pour l'index de l'image actuelle et l'image suivante
      let index = 0, next = null;
  
      // Parcourt la collection d'images pour trouver l'index de l'image actuellement affichée
      $(imagesCollection).each(function(i) {
          if ($(activeImage).attr("src") === $(this).attr("src")) {
              index = i;
          }
      });
  
      // Détermine l'image suivante dans la collection
      // Si l'image actuelle est la dernière de la collection, prend la première image comme suivante
      next = imagesCollection[index + 1] || imagesCollection[0];
  
      // Met à jour l'attribut "src" de l'image dans la lightbox pour afficher l'image suivante
      $(`#${lightboxId} .lightboxImage`).attr("src", $(next).attr("src"));
  },
  
    // Création de la lightbox
    createLightBox(gallery, lightboxId, navigation) {
      // Ajout d'un élément HTML pour la modale de la lightbox dans le conteneur de la galerie
      gallery.append(`
          <div class="modal fade" id="${
            // Si lightboxId est défini, utilisez-le comme ID pour la modale, sinon utilisez "galleryLightbox"
            lightboxId ? lightboxId : "galleryLightbox"
          }" tabindex="-1" role="dialog" aria-labelledby="modal-dialog" aria-describedby="modal-dialog" aria-hidden="true">
              <div id="modal-dialog" class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-body">
                          ${
                            // Si la navigation est activée, ajoutez un bouton de navigation "précédent"
                            navigation
                              ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                              : '<span style="display:none;" />'
                          }
                          <!-- Image affichée dans la lightbox -->
                          <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                          ${
                            // Si la navigation est activée, ajoutez un bouton de navigation "suivant"
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
      // Initialise la variable tagItems avec un élément de liste pour l'option "Tous"
      var tagItems = '<li class="nav-item"><span class="nav-link active-tag" data-images-toggle="all">Tous</span></li>';
  
      // Parcourt chaque élément du tableau tags
      $.each(tags, function(index, value) {
          // Ajoute un élément de liste pour chaque tag dans la variable tagItems
          tagItems += `<li class="nav-item">
                  <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
  
      // Crée une barre de tags (tagsRow) en entourant les tags par une balise ul avec des classes pour le style
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
  
      // Vérifie la position des tags (haut ou bas)
      if (position === "bottom") {
          // Si la position est "bottom", ajoute la barre de tags à la fin de l'élément gallery
          gallery.append(tagsRow);
      } else if (position === "top") {
          // Si la position est "top", ajoute la barre de tags au début de l'élément gallery
          gallery.prepend(tagsRow);
      } else {
          // Si la position est inconnue, affiche une erreur dans la console
          console.error(`Unknown tags position: ${position}`);
      }
  },
  
    // Filtrer les éléments par tag
    filterByTag() {
      // Récupère le tag associé à l'élément sur lequel on a cliqué
      let tag = $(this).data("images-toggle");
  
      // Retire la classe "active-tag" de tous les éléments ayant la classe "nav-link"
      $(".nav-link").removeClass("active-tag");
  
      // Ajoute la classe "active-tag" à l'élément sur lequel on a cliqué
      $(this).addClass("active-tag");
  
      // Si le tag est "all", affiche tous les éléments ayant la classe "gallery-item"
      if (tag === "all") {
          $(".gallery-item").parents(".item-column").show();
      } else {
          // Sinon, cache tous les éléments parents des éléments ayant la classe "gallery-item"
          $(".gallery-item").parents(".item-column").hide();
  
          // Puis affiche uniquement les éléments parents des "gallery-item" qui ont le tag correspondant
          $(".gallery-item[data-gallery-tag='" + tag + "']").parents(".item-column").show();
      }
  },
  
  };
})(jQuery);
