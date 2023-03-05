//-- Global Variables --//
const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const FRIENDS_PER_PAGE = 12

const friends = []
let filteredFriends = []
let favoriteFriends = JSON.parse(localStorage.getItem('favoriteFriends')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


//-- Render Data-panel --//
axios.get(INDEX_URL)
  .then(res => {
    friends.push(...res.data.results)
    renderFriendList(getFriendsByPage(1))
    renderPaginator(friends.length)
  })
  .catch(error => console.log(error))


//-- Event Listeners --//
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-add-favorite')) {
    event.target.classList.toggle('active')
    addToFavorite(event.target, Number(event.target.dataset.friendId))
  } else if (event.target.dataset.friendId) {
    showFriendModal(event.target.dataset.friendId)
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredFriends = friends.filter(friend => {
    return `${friend.name} ${friend.surname}`.toLowerCase().includes(keyword)
  })

  if (filteredFriends.length === 0) {
    return alert('Can\'t find friends with keyword: ' + keyword)
  }

  renderFriendList(getFriendsByPage(1))
  renderPaginator(filteredFriends.length)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderFriendList(getFriendsByPage(page))
})


//-- Functions --//
function renderFriendList(data) {
  let html = ''
  // name, surname, avatar
  data.forEach(item => {
    // 若 item 已存在於 favoriteFriends，則渲染紅色愛心
    if (favoriteFriends.some(friend => friend.id === item.id)) {
      html += `
        <div class="card m-2 p-0">
          <div class="position-relative">
            <img src=${item.avatar} data-friend-id="${item.id}" class="card-img-top" alt="Friend's avatar" data-bs-toggle="modal" data-bs-target="#friend-modal">
            <i data-friend-id="${item.id}" class="fa-solid fa-heart btn-add-favorite active"></i>
          </div>
          <div data-friend-id="${item.id}" class="card-body" data-bs-toggle="modal" data-bs-target="#friend-modal">
            <h5 data-friend-id="${item.id}" class="card-title m-0" data-bs-toggle="modal" data-bs-target="#friend-modal">${item.name} ${item.surname}</h5>
          </div>
        </div>
      `
    } else {
      html += `
        <div class="card m-2 p-0">
          <div class="position-relative">
            <img src=${item.avatar} data-friend-id="${item.id}" class="card-img-top" alt="Friend's avatar" data-bs-toggle="modal" data-bs-target="#friend-modal">
            <i data-friend-id="${item.id}" class="fa-solid fa-heart btn-add-favorite"></i>
          </div>
          <div data-friend-id="${item.id}" class="card-body" data-bs-toggle="modal" data-bs-target="#friend-modal">
            <h5 data-friend-id="${item.id}" class="card-title m-0" data-bs-toggle="modal" data-bs-target="#friend-modal">${item.name} ${item.surname}</h5>
          </div>
        </div>
      `
    }
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
      // console.log(user)
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

function addToFavorite(element, id) {
  const friend = friends.find(friend => friend.id === id)

  if (element.matches('.active')) {
    favoriteFriends.push(friend)
  } else {
    removeFromFavorite(id)
  }

  // console.log(friend)
  localStorage.setItem('favoriteFriends', JSON.stringify(favoriteFriends))
}

function removeFromFavorite(id) {
  if (!favoriteFriends.length) return

  const friendIndex = favoriteFriends.findIndex(friend => friend.id === id)
  if (friendIndex === -1) return

  favoriteFriends.splice(friendIndex, 1)
}

function getFriendsByPage(page) {
  const data = filteredFriends.length ? filteredFriends : friends

  startIndex = (page - 1) * FRIENDS_PER_PAGE
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
  let html = ''

  for (let page = 1; page <= numberOfPages; page++) {
    html += `
      <li class="page-item"><a class="page-link" data-page=${page} href="#">${page}</a></li>
    `
  }

  paginator.innerHTML = html
}