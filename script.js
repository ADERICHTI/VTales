// DOM Elements
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

// Render all story cards on the home page
function renderStoryCards() {
  storyCardsContainer.innerHTML = '';
  
  Object.entries(stories).forEach(([title, storyData]) => {
    const storyCard = document.createElement('div');
    storyCard.className = 'story-card paper-layer';
    
    // Generate a unique color for each story card based on title hash
    const hue = hashCode(title) % 360;
    const color = `hsl(${hue}, 60%, 85%)`;
    const darkColor = `hsl(${hue}, 60%, 70%)`;
    
    storyCard.innerHTML = `
      <div class="story-card-image" style="background-color: ${color};"></div>
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
  currentStory = stories[storyTitle];
  
  // Update the story view title
  storyViewTitle.textContent = storyTitle;
  
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
  likeButton.addEventListener('click', () => {
    likeButton.classList.toggle('liked');
    if (likeButton.classList.contains('liked')) {
      likeButton.innerHTML = '<i class="fas fa-heart"></i> Liked!';
    } else {
      likeButton.innerHTML = '<i class="fas fa-heart"></i>';
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
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
