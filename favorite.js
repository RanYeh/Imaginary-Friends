//-- Global Variables --//
const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const friends = JSON.parse(localStorage.getItem('favoriteFriends')) || []
const dataPanel = document.querySelector('#data-panel')


//-- Render Data-panel --//
renderFriendList(friends)


//-- Event Listeners --//
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.friendId))
  } else if (event.target.dataset.friendId) {
    showFriendModal(event.target.dataset.friendId)
  }
})


//-- Functions --//
function renderFriendList(data) {
  let html = ''
  // name, surname, avatar
  data.forEach(item => {
    html += `
      <div class="card m-2 p-0">
        <div class="position-relative">
          <img src=${item.avatar} data-friend-id="${item.id}" class="card-img-top" alt="Friend's avatar" data-bs-toggle="modal" data-bs-target="#friend-modal">
        </div>
        <div data-friend-id="${item.id}" class="card-body" data-bs-toggle="modal" data-bs-target="#friend-modal">
          <h5 data-friend-id="${item.id}" class="card-title m-0" data-bs-toggle="modal" data-bs-target="#friend-modal">${item.name} ${item.surname}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-danger btn-remove-favorite" data-friend-id="${item.id}">Remove</button>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = html
}

function showFriendModal(id) {
  const name = document.querySelector('#modal-friend-name')
  const avatar = document.querySelector('#friend-modal-avatar')
  const info = document.querySelector('#friend-modal-info')

  // 清空先前資料
  name.textContent = ''
  avatar.src = ''
  info.innerHTML = ''

  axios.get(INDEX_URL + id)
    .then(res => {
      const user = res.data
      name.textContent = user.name + ' ' + user.surname
      avatar.src = user.avatar

      let infoHTML = `
        <p><b>Gender</b>: ${user.gender}</p>
        <p><b>Birthday</b>: ${user.birthday}</p>
        <p><b>Age</b>: ${user.age}</p>
        <p><b>Region</b>: ${user.region}<p>
        <p><b>E-mail</b>: <br>${user.email}<p>
      `
      info.innerHTML = infoHTML
    })
    .catch(error => console.log(error))
}

function removeFromFavorite(id) {
  if (!friends || !friends.length) return

  const friendIndex = friends.findIndex(friend => friend.id === id)
  if (friendIndex === -1) return

  friends.splice(friendIndex, 1)
  localStorage.setItem('favoriteFriends', JSON.stringify(friends))

  renderFriendList(friends)
}