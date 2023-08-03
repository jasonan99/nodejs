$(document).ready(function() {
  const addCardForm = $('#addCardForm');
  const editCardForm = $('#editCardForm');
  const searchButton = $('#searchButton');
  const searchTermInput = $('#searchTerm');
  const cardList = $('#cardList');
  const pagination = $('#pagination');
  const sortBySelect = $('#sortBy');
  const sortOrderSelect = $('#sortOrder');
  const typeFilterSelect = $('#typeFilter');
  const filterButton = $('#filterButton');

  addCardForm.submit(function(event) {
    event.preventDefault();

    const type = $('#type').val();
    const name = $('#name').val();
    const description = $('#description').val();
    const battlePoints = $('#battlePoints').val();

    const cardData = {
      type: type,
      name: name,
      description: description,
      battlePoints: battlePoints
    };

    $.post('/add-card', cardData, function(data) {
      $('#type').val('');
      $('#name').val('');
      $('#description').val('');
      $('#battlePoints').val('');
      fetchCards(1);
    });
  });

  searchButton.click(function() {
    const searchTerm = searchTermInput.val();

    searchTermInput.val('');
    pagination.hide();

    $.get(`/search-cards?term=${searchTerm}`, function(cards) {
      $('#cardList').empty();

      cards.forEach(function(card) {
        const cardItem = $('<div class="card">');

        const typeParagraph = $('<p>').append($('<span>').text('Type:')).append(` ${card.type}`);
        const nameParagraph = $('<p>').append($('<span>').text('Name:')).append(` ${card.name}`);
        const descriptionParagraph = $('<p>').append($('<span>').text('Description:')).append(` ${card.description}`);
        const battlePointsParagraph = $('<p>').append($('<span>').text('Battle Points:')).append(` ${card.battlePoints}`);
        
        const buttonsDiv = $('<div class="card-buttons">');
        const editButton = $('<button class="edit-button">').text('Edit').attr('data-cardid', card._id);
        const deleteButton = $('<button class="delete-button">').text('Delete').data('cardid', card._id);
        
        buttonsDiv.append(editButton).append(deleteButton);
        
        cardItem.append(typeParagraph)
                .append(nameParagraph)
                .append(descriptionParagraph)
                .append(battlePointsParagraph)
                .append(buttonsDiv);
  
        $('#cardList').append(cardItem);
      });
    });
  });

  filterButton.click(function() {
    fetchCards(1);
    pagination.show();
  });

  function createCardElement(card) {
    const cardElement = $('<div class="card">');
  
    const typeElement = $('<p>').append($('<span>').text('Type:')).append(` ${card.type}`);
    const nameElement = $('<p>').append($('<span>').text('Name:')).append(` ${card.name}`);
    const descriptionElement = $('<p>').append($('<span>').text('Description:')).append(` ${card.description}`);
    const battlePointsElement = $('<p>').append($('<span>').text('Battle Points:')).append(` ${card.battlePoints}`);
  
    const cardButtonsDiv = $('<div class="card-buttons">');
  
    const editButton = $('<button class="edit-button">').text('Edit').attr('data-cardid', card._id);
    const deleteButton = $('<button class="delete-button">').text('Delete').data('cardid', card._id);
  
    cardButtonsDiv.append(editButton).append(deleteButton);
  
    cardElement.append(typeElement);
    cardElement.append(nameElement);
    cardElement.append(descriptionElement);
    cardElement.append(battlePointsElement);
    cardElement.append(cardButtonsDiv);
  
    return cardElement;
  }   

  function fetchCards(page) {
    const limit = 8;
    const sortBy = sortBySelect.val();
    const sortOrder = sortOrderSelect.val();
    const typeFilter = typeFilterSelect.val();

    $.get('/get-total-cards', function(totalCards) {
      const totalPages = Math.ceil(totalCards / limit);

      $.get(`/get-cards?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&type=${typeFilter}`, function(cards) {
        cardList.empty();

        cards.forEach(function(card) {
          const cardItem = createCardElement(card);

          cardList.append(cardItem);
        });

        updatePagination(page, totalPages);
      });
    });
  }

  function updatePagination(currentPage, totalPages) {
    pagination.empty();

    if (currentPage > 1) {
      pagination.append(
        `<button class="pagination-button" data-page="${currentPage - 1}">Previous</button>`
      );
    }

    for (let i = 1; i <= totalPages; i++) {
      pagination.append(
        `<button class="pagination-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`
      );
    }

    if (currentPage < totalPages) {
      pagination.append(
        `<button class="pagination-button" data-page="${currentPage + 1}">Next</button>`
      );
    }
  }

  pagination.on('click', '.pagination-button', function() {
    const page = parseInt($(this).data('page'));
    fetchCards(page);
  });

  function showEditForm(card) {
    editCardForm.show();
    $('#editCardId').val(card._id);
    $('#editType').val(card.type);
    $('#editName').val(card.name);
    $('#editDescription').val(card.description);
    $('#editBattlePoints').val(card.battlePoints);
  }

  cardList.on('click', '.edit-button', function() {
    const cardId = $(this).data('cardid');
    console.log('Card ID:', cardId);

    $.get(`/get-card/${cardId}`, function(card) {
      showEditForm(card);
    });
  });

  $('#editForm').submit(function(event) {
    event.preventDefault();

    const cardId = $('#editCardId').val();
    const type = $('#editType').val();
    const name = $('#editName').val();
    const description = $('#editDescription').val();
    const battlePoints = $('#editBattlePoints').val();

    const updatedCardData = {
      type: type,
      name: name,
      description: description,
      battlePoints: battlePoints
    };

    updateCard(cardId, updatedCardData);
  });

  cardList.on('click', '.delete-button', function() {
    const cardId = $(this).data('cardid');
    deleteCard(cardId);
  });

  function updateCard(cardId, updatedCardData) {
    $.ajax({
      url: `/edit-card/${cardId}`,
      method: 'PUT',
      data: updatedCardData,
      success: function() {
        fetchCards();
        editCardForm.hide();
      },
      error: function(error) {
        console.error('Error updating card', error);
      }
    });
  }

  function deleteCard(cardId) {
    $.ajax({
      url: `/delete-card/${cardId}`,
      method: 'DELETE',
      success: function() {
        fetchCards(1);
      },
      error: function(error) {
        console.error('Error while deleting card', error);
      }
    });
  }

  function showEditOverlay(card) {
    $('#editCardId').val(card._id);
    $('#editType').val(card.type);
    $('#editName').val(card.name);
    $('#editDescription').val(card.description);
    $('#editBattlePoints').val(card.battlePoints);
    $('#editOverlay').show();
    $('body').addClass('overlay-open');
  }

  function hideEditOverlay() {
    $('#editOverlay').hide();
    $('body').removeClass('overlay-open');
  }

  cardList.on('click', '.edit-button', function() {
    const cardId = $(this).data('cardid');
    console.log('Card ID:', cardId);

    $.get(`/get-card/${cardId}`, function(card) {
      showEditOverlay(card);
    });
  });

  $('#closeEditOverlay').click(function() {
    hideEditOverlay();
  });

  $('#editForm').submit(function(event) {
    event.preventDefault();
    const cardId = $('#editCardId').val();
    const type = $('#editType').val();
    const name = $('#editName').val();
    const description = $('#editDescription').val();
    const battlePoints = $('#editBattlePoints').val();

    const updatedCardData = {
      type: type,
      name: name,
      description: description,
      battlePoints: battlePoints
    };

    updateCard(cardId, updatedCardData);

    hideEditOverlay();
  });

  $('#editOverlay').click(function(event) {
    if (event.target === this) {
      hideEditOverlay();
    }
  });

  fetchCards(1);
});
