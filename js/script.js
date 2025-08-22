// Import the auth module
// import {currentUser} from './firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  getDoc,
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  increment 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(window.app);

// DOM Elements
const pageTitle = document.querySelector('title');
const contentArea = document.getElementById('content-area');
const homeSection = document.getElementById('home-section');
const storySection = document.getElementById('story-section');
const chapterSection = document.getElementById('chapter-section');
const storyCardsContainer = document.getElementById('story-cards');
const chapterCardsContainer = document.getElementById('chapter-cards');
const storyViewTitle = document.getElementById('story-view-title');
const chapterViewTitle = document.getElementById('chapter-view-title');
const chapterContent = document.getElementById('chapter-content');
const latestChapterInfo = document.getElementById('latest-chapter-info');
const heroBackground = document.getElementById('hero-background');
const navLinks = document.querySelectorAll('nav a');
const backButtons = document.querySelectorAll('.back-btn');
const likeButton = document.getElementById('story-like-btn');
const scrollTopBtn = document.getElementById('scroll-top-btn');
const scrollBottomBtn = document.getElementById('scroll-bottom-btn');
const prevChapterBtn = document.getElementById('prev-chapter-btn');
const nextChapterBtn = document.getElementById('next-chapter-btn');
const footer = document.getElementById('footer');
const dialogOverlay = document.getElementById('dialog-overlay');
const closeDialogBtn = document.getElementById('close-dialog-btn');

// App State
let currentStory = null;
let currentChapterIndex = 0;

// Initialize the app
function init() {
  renderStoryCards();
  setupEventListeners();
  animateInkStrokes();
  updateHeroBackground();
}

function changePageTitle(title) {
  pageTitle.textContent = `VTales | ${title.toUpperCase()}`
}

function toTitleCase(str) {
  return str
  .toLowerCase()
  .split('')
  .map(word => word.charAt(0).toUppercase() + word.slice(1))
  .join('');
}

// Render all story cards on the home page
function renderStoryCards() {
  storyCardsContainer.innerHTML = '';
  
  Object.entries(stories).forEach(([title, storyData]) => {
    const storyCard = document.createElement('div');
    storyCard.className = 'story-card paper-layer';
    
    // Generate a unique color for each story card based on title hash
    const hue = hashCode(storyData.genre);
    const color = `hsl(${hue[0]}, 60%, 85%)`;
    const darkColor = `hsl(${hue}, 60%, 70%)`;
    
    storyCard.innerHTML = `
      <div class="story-card-image" style="background-image: linear-gradient(hsl(${hue[0]}, 60%, 85%, 30%), hsl(${hue[0]}, 60%, 85%, 66%)), url('https://raw.githubusercontent.com/ADERICHTI/Images001/refs/heads/main/Mech%20Hunter.png');"></div>
      <div class="story-card-content" style="background-color: ${color};">
        <h3 class="story-card-title">${title}</h3>
        <p class="story-card-description">${storyData.logline}</p>
        <span class="story-card-genre">${storyData.genre || 'Adventure'}</span>
      </div>
    `;
    
    storyCard.addEventListener('click', () => showStory(title));
    storyCardsContainer.appendChild(storyCard);
  });
}

// Show a specific story with all its chapters
function showStory(storyTitle) {
  changePageTitle(storyTitle);
  currentStory = stories[storyTitle];
  currentStoryId = storyTitle.toLowerCase().replace(/\s+/g, '-');
  
  // Check if user already liked this story
  // checkIfLiked(currentStoryId);
  
  // Update the story view title
  storyViewTitle.textContent = storyTitle;
  
  // Add logline with expand/collapse functionality
  const loglineText = document.querySelector('.logline-text');
  const loglineToggle = document.querySelector('.logline-toggle');
  
  loglineText.textContent = currentStory.logline;
  loglineText.classList.add('collapsed');
  loglineToggle.textContent = 'Read More';
  
  loglineToggle.addEventListener('click', () => {
    if (loglineText.classList.contains('collapsed')) {
      loglineText.classList.remove('collapsed');
      loglineToggle.textContent = 'Read Less';
    } else {
      loglineText.classList.add('collapsed');
      loglineToggle.textContent = 'Read More';
    }
  });  

  // async function checkIfLiked(storyId) {
  // if (!window.currentUser) return;
  
  // const userRef = doc(db, "users", window.currentUser.uid);
  // const userDoc = await getDoc(userRef);
  
  // if (userDoc.exists()) {
  //   const userData = userDoc.data();
  //   const isLiked = userData.likedStories?.includes(storyId);
    
  //   if (isLiked) {
  //     likeButton.classList.add('liked');
  //     likeButton.innerHTML = '<i class="fas fa-heart"></i> Liked!';
  //   }
  // }
  // }


  
  // Render the latest chapter
  if (currentStory.chapters.length > 0) {
    const latestChapter = currentStory.chapters[currentStory.chapters.length - 1];
    latestChapterInfo.innerHTML = `
      <div class="chapter-number">Chapter ${latestChapter.number}</div>
      <h4 class="chapter-title">${latestChapter.title}</h4>
      <button class="read-chapter-btn" data-index="${currentStory.chapters.length - 1}">Read Chapter</button>
    `;
    
    // Add event listener to the read chapter button
    latestChapterInfo.querySelector('.read-chapter-btn').addEventListener('click', (e) => {
      showChapter(storyTitle, parseInt(e.target.dataset.index));
    });
  } else {
    latestChapterInfo.innerHTML = '<p>No chapters available yet.</p>';
  }
  
  // Render all chapter cards
  chapterCardsContainer.innerHTML = '';
  currentStory.chapters.forEach((chapter, index) => {
    const chapterCard = document.createElement('div');
    chapterCard.className = 'chapter-card paper-layer';
    chapterCard.innerHTML = `
      <div class="chapter-card-number">Chapter ${chapter.number}</div>
      <h4 class="chapter-card-title">${chapter.title}</h4>
    `;
    chapterCard.addEventListener('click', () => showChapter(storyTitle, index));
    chapterCardsContainer.appendChild(chapterCard);
  });
  
  // Switch to story section
  homeSection.classList.remove('active-section');
  homeSection.classList.add('hidden-section');
  storySection.classList.remove('hidden-section');
  storySection.classList.add('active-section');
  chapterSection.classList.remove('active-section');
  chapterSection.classList.add('hidden-section');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show a specific chapter of a story
function showChapter(storyTitle, chapterIndex) {
  changePageTitle(`${storyTitle} | ${`Chapter ${stories[storyTitle].chapters[chapterIndex].number}: ${stories[storyTitle].chapters[chapterIndex].title}`}`)
  const story = stories[storyTitle];
  const chapter = story.chapters[chapterIndex];
  
  // Update current story and chapter index
  currentStory = story;
  currentChapterIndex = chapterIndex;
  
  // Update the chapter view title
  chapterViewTitle.textContent = `${storyTitle} - Chapter ${chapter.number}: ${chapter.title}`;
  
  // Render the chapter content
  chapterContent.innerHTML = `
    <h3>Chapter ${chapter.number}: ${chapter.title}</h3>
    ${chapter.story.split('\n').map(para => `<p>${para}</p>`).join('')}
  `;
  
  // Update navigation buttons
  prevChapterBtn.disabled = chapterIndex === 0;
  nextChapterBtn.disabled = chapterIndex === story.chapters.length - 1;
  
  // Add event listeners to navigation buttons
  prevChapterBtn.onclick = () => showChapter(storyTitle, chapterIndex - 1);
  nextChapterBtn.onclick = () => showChapter(storyTitle, chapterIndex + 1);
  
  // Switch to chapter section
  homeSection.classList.remove('active-section');
  homeSection.classList.add('hidden-section');
  storySection.classList.remove('active-section');
  storySection.classList.add('hidden-section');
  chapterSection.classList.remove('hidden-section');
  chapterSection.classList.add('active-section');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Go back to home from story or chapter view
function goBack() {
  if (chapterSection.classList.contains('active-section')) {
    // If in chapter view, go back to story view
    chapterSection.classList.remove('active-section');
    chapterSection.classList.add('hidden-section');
    storySection.classList.remove('hidden-section');
    storySection.classList.add('active-section');
  } else if (storySection.classList.contains('active-section')) {
    // If in story view, go back to home
    storySection.classList.remove('active-section');
    storySection.classList.add('hidden-section');
    homeSection.classList.remove('hidden-section');
    homeSection.classList.add('active-section');
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update hero background with latest stories
function updateHeroBackground() {
  const storyTitles = Object.keys(stories);
  if (storyTitles.length > 0) {
    // Get the latest story (for demo purposes, we'll just use the first one)
    const latestStory = stories[storyTitles[0]];
    if (latestStory.imageUrl) {
      heroBackground.style.backgroundImage = `url(${latestStory.imageUrl})`;
      heroBackground.style.opacity = '0.3';
    }
  }
}

// Animate ink strokes in headings
function animateInkStrokes() {
  const inkStrokes = document.querySelectorAll('.ink-stroke');
  inkStrokes.forEach((stroke, index) => {
    setTimeout(() => {
      stroke.classList.add('active');
    }, 300 * index);
  });
}

// Setup all event listeners
function setupEventListeners() {
  // Navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      
      // Update active nav link
      navLinks.forEach(navLink => navLink.classList.remove('active'));
      link.classList.add('active');
      
      // Show the selected section
      if (section === 'home') {
        goBack();
      }
    });
  });
  
  // Back buttons
  backButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      goBack();
    });
  });
  
  // Like button
// likeButton.addEventListener('click', async () => {
  // Opens dialog when clicked ( Changes will be made later )
  likeButton.addEventListener('click', () => {
    dialogOverlay.classList.add('active');
  });
  // if (!currentUser) {
  //   showAuthModal();
  //   return;
  // }

  // if (!currentStoryId) {
  //   console.error("No story selected");
  //   return;
  // }

  // const isLiked = likeButton.classList.contains('liked');

  
  // try {
  //   if (isLiked) {
  //     await unlikeStory(currentStoryId, currentUser.uid);
  //     likeButton.classList.remove('liked');
  //     likeButton.innerHTML = '<i class="fas fa-heart"></i>';
  //   } else {
  //     await likeStory(currentStoryId, currentUser.uid);
  //     likeButton.classList.add('liked');
  //     likeButton.innerHTML = '<i class="fas fa-heart"></i> Liked!';
  //   }
  // } catch (error) {
  //   console.error("Like error:", error);
  // }
// });

// Firestore functions
// async function likeStory(storyId, userId) {
//   const userRef = doc(db, "users", userId);
//   const storyRef = doc(db, "stories", storyId);
  
//   // Update user's liked stories
//   await updateDoc(userRef, {
//     likedStories: arrayUnion(storyId),
//     lastLiked: new Date()
//   }, { merge: true });
  
//   // Update story's like count
//   await updateDoc(storyRef, {
//     likes: increment(1),
//     likedBy: arrayUnion(userId)
//   }, { merge: true });
// }

// async function unlikeStory(storyId, userId) {
//   const userRef = doc(db, "users", userId);
//   const storyRef = doc(db, "stories", storyId);
  
//   // Remove from user's liked stories
//   await updateDoc(userRef, {
//     likedStories: arrayRemove(storyId)
//   }, { merge: true });
  
//   // Update story's like count
//   await updateDoc(storyRef, {
//     likes: increment(-1),
//     likedBy: arrayRemove(userId)
//   }, { merge: true });
//     }

  //-------------–-------------_-----------_----

  // Chapter header scroll effect
window.addEventListener('scroll', () => {
  const chapterHeader = document.querySelector('.chapter-header');
  if (chapterHeader) {
    if (window.scrollY > 50) {
      chapterHeader.classList.add('compact');
    } else {
      chapterHeader.classList.remove('compact');
    }
  }
});
  
  // Scroll to top button
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // Scroll to bottom button
  scrollBottomBtn.addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
  
  // Show/hide scroll buttons based on scroll position
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    
    // Show scroll to top button when scrolled down
    if (scrollPosition > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
    
    // Show scroll to bottom button when not at bottom
    if (scrollPosition < documentHeight - windowHeight - 100) {
      scrollBottomBtn.classList.add('visible');
    } else {
      scrollBottomBtn.classList.remove('visible');
    }
  });
  
  // Footer click to show contact dialog
  footer.addEventListener('click', () => {
    dialogOverlay.classList.add('active');
  });
  
  // Close dialog button
  closeDialogBtn.addEventListener('click', () => {
    dialogOverlay.classList.remove('active');
  });
  
  // Close dialog when clicking outside
  dialogOverlay.addEventListener('click', (e) => {
    if (e.target === dialogOverlay) {
      dialogOverlay.classList.remove('active');
    }
  });
}

// Helper function to generate a hash code from a string
// function hashCode(str) {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   return hash;
// }

function hashCode(str) {
    // Common genres with predefined HSL colors
    const genreColors = {
        'fantasy': 'hsl(270, 70%, 60%)',      // Magical purple - mystical and dreamy
        'sci-fi': 'hsl(210, 80%, 55%)',       // Futuristic blue - technology and space
        'horror': 'hsl(0, 75%, 35%)',         // Blood red - danger and fear
        'romance': 'hsl(330, 75%, 65%)',      // Romantic pink - love and passion
        'adventure': 'hsl(120, 65%, 45%)',    // Forest green - exploration and nature
        'sci-fi horror': 'hsl(280, 70%, 40%)', // Cosmic purple - eerie and technological
        'sci-fi adventure': 'hsl(180, 70%, 45%)', // Teal - exploration and futurism
        'fantasy adventure': 'hsl(150, 65%, 50%)', // Emerald - magical exploration
        'fantasy adventure sci-fi': 'hsl(225, 70%, 55%)', // Royal blue - epic crossover
        'comedy': 'hsl(50, 85%, 60%)'         // Sunny yellow - bright and cheerful
    };
    
    // Convert to lowercase and trim for case-insensitive matching
    const normalizedGenre = str.toLowerCase().trim();
    
    // Return predefined color if genre matches exactly
    if (genreColors[normalizedGenre]) {
        return genreColors[normalizedGenre];
    }
    
    // Check for partial matches with priority to more specific genres
    const genres = normalizedGenre.split(/\s+/);
    
    // Try to find the most relevant genre match
    for (const genre of genres) {
        if (genreColors[genre] && genre.length > 2) { // Only consider meaningful words
            return genreColors[genre];
        }
    }
    
    // Fallback: Generate a consistent color from hash for unknown genres
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate pleasant HSL color
    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 45 + (Math.abs(hash) % 15);  // 45-60%
    
    return [hue, saturation, lightness];
}


// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
