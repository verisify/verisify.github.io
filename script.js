// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    addDoc, 
    getDoc, 
    setDoc, 
    Timestamp 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
  
  
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyALc7_O7VJzigqOaVLYjcl5yCCysnmyOG0",
    authDomain: "rateniggov-419a4.firebaseapp.com",
    projectId: "rateniggov-419a4",
    storageBucket: "rateniggov-419a4.appspot.com",
    messagingSenderId: "293215706435",
    appId: "1:293215706435:web:bbf1190e97208185caa3f6",
    measurementId: "G-C2KSLESE2D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Governor class definition
class Governor {
  constructor(id, rank, name, image, state, infrastructure, security, education, healthcare, jobs, weekStartDate, totalVotes, engagement) {
    this.id = id;
    this.rank = rank;
    this.name = name;
    this.image = image;
    this.state = state;
    this.weekStartDate = weekStartDate;
    this.totalVotes = totalVotes || 0;
    this.engagement = engagement || 0;
    
    // Initialize categories with their vote counts
    this.categories = {
      infrastructure: { votes: parseInt(infrastructure) || 0, userVote: null },
      security: { votes: parseInt(security) || 0, userVote: null },
      education: { votes: parseInt(education) || 0, userVote: null },
      healthcare: { votes: parseInt(healthcare) || 0, userVote: null },
      jobs: { votes: parseInt(jobs) || 0, userVote: null },
    };
    
    // Load user interactions from local storage
    this.userInteractions = this.loadUserInteractions();
  }

  // Load user interactions from local storage
  loadUserInteractions() {
    const storedInteractions = localStorage.getItem(`userInteractions_${this.id}`);
    return storedInteractions ? JSON.parse(storedInteractions) : {};
  }

  // Save user interactions to local storage
  saveUserInteractions() {
    localStorage.setItem(`userInteractions_${this.id}`, JSON.stringify(this.userInteractions));
  }

    async vote(category, type) {
        const categoryData = this.categories[category];
        let voteChange = 0;

        if (type === 'upvote') {
            if (categoryData.userVote === 'upvoted') {
                // If already upvoted, remove the upvote
                categoryData.votes -= 1;
                categoryData.userVote = null;
                this.totalVotes -= 1;
                voteChange = -1;
            } else {
                if (categoryData.userVote === 'downvoted') {
                    // If previously downvoted, remove downvote and add upvote
                    categoryData.votes += 2;
                    this.totalVotes += 2;
                    voteChange = 2;
                } else {
                    // If not voted before, add upvote
                    categoryData.votes += 1;
                    this.totalVotes += 1;
                    voteChange = 1;
                }
                categoryData.userVote = 'upvoted';
            }
        } else if (type === 'downvote') {
            if (categoryData.userVote === 'downvoted') {
                // If already downvoted, remove the downvote
                categoryData.votes += 1;
                categoryData.userVote = null;
                this.totalVotes += 1;
                voteChange = 1;
            } else {
                if (categoryData.userVote === 'upvoted') {
                    // If previously upvoted, remove upvote and add downvote
                    categoryData.votes -= 2;
                    this.totalVotes -= 2;
                    voteChange = -2;
                } else {
                    // If not voted before, add downvote
                    categoryData.votes -= 1;
                    this.totalVotes -= 1;
                    voteChange = -1;
                }
                categoryData.userVote = 'downvoted';
            }
        }

        // Update engagement only if it's the first interaction with this category
        if (!this.userInteractions[category]) {
            this.engagement += 1;
            this.userInteractions[category] = true;
            this.saveUserInteractions();
        }

        this.updateVotesDisplay(category);

        // Update the database with new values
        const governorRef = doc(db, 'governors', this.id);
        await updateDoc(governorRef, {
            [category]: categoryData.votes,
            totalVotes: this.totalVotes,
            engagement: this.engagement,
            weekStartDate: this.weekStartDate
        });

        debouncedUpdateWeeklyReport();
    }

  updateVotesDisplay(category) {
    const categoryData = this.categories[category];
    
    // Update vote count display
    document.querySelector(`#votes-${category}-${this.rank}`).textContent = categoryData.votes;

    // Get upvote and downvote buttons
    const upvoteBtn = document.querySelector(`#upvote-${category}-${this.rank}`);
    const downvoteBtn = document.querySelector(`#downvote-${category}-${this.rank}`);

    // Update button colors based on user's vote
    upvoteBtn.style.color = categoryData.userVote === 'upvoted' ? 'blue' : '';
    downvoteBtn.style.color = categoryData.userVote === 'downvoted' ? 'red' : '';

    // Update total votes and engagement display
    document.querySelector(`#total-votes-${this.rank}`).textContent = this.totalVotes;
    document.querySelector(`#engagement-${this.rank}`).textContent = this.engagement;
  }

  render() {
    // Create vote section for each category
    const createVoteSection = (category) => `
      <td class="px-6 py-4">
        <div class="flex items-center">
          <button id="downvote-${category}-${this.rank}" class="vote-btn downvote-btn p-1 me-3" data-id="${this.rank}" data-category="${category}" type="button">
            <i class="bi bi-dash-circle-fill text-2xl"></i>
          </button>
          <span id="votes-${category}-${this.rank}" class="votes-count">${this.categories[category].votes}</span>
          <button id="upvote-${category}-${this.rank}" class="vote-btn upvote-btn p-1 ms-3" data-id="${this.rank}" data-category="${category}" type="button">
            <i class="bi bi-plus-circle-fill text-2xl"></i>
          </button>
        </div>
      </td>
    `;

    // Return the full HTML for the governor row
    return `
      <tr class="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
        <td class="p-4">${this.rank}</td>
        <th scope="row" class="flex items-center px-6 py-4 text-white whitespace-nowrap">
          <img class="w-10 h-10 rounded-full" src="${this.image}" alt="${this.name}">
          <div class="pl-3">
            <div class="text-base font-semibold">${this.name}</div>
            <div class="font-normal text-gray-400">${this.state}</div>
          </div>
        </th>
        ${createVoteSection('infrastructure')}
        ${createVoteSection('security')}
        ${createVoteSection('education')}
        ${createVoteSection('healthcare')}
        ${createVoteSection('jobs')}
        <td class="px-6 py-4">
          <span id="total-votes-${this.rank}">${this.totalVotes}</span>
        </td>
        <td class="px-6 py-4">
          <span id="engagement-${this.rank}">${this.engagement}</span>
        </td>
      </tr>
    `;
  }
}

// Array to store governor objects
let governors = [];

// Function to get week range (Monday to Sunday)
function getWeekRange(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Set to Monday
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Set to Sunday
  end.setHours(23, 59, 59, 999);

  return [start, end];
}

// Function to get the previous week's date range
function getPreviousWeekRange(today) {
    const currentDate = new Date(today);
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + 7; // Days since last Monday
    const lastMonday = new Date(currentDate);
    lastMonday.setDate(currentDate.getDate() - diffToMonday);
    lastMonday.setHours(0, 0, 0, 0); // Set to midnight
    return lastMonday;
}

// Update the renderGovernors function to always fetch current data from the 'governors' collection:
const renderGovernors = async (selectedDate) => {
  try {
    const currentMonday = getPreviousMonday(new Date());
    await fetchWeeklyResults(currentMonday);
    updateWeeklyReport();
  } catch (error) {
    console.error("Error rendering governors:", error);
    displayErrorMessage();
  }
};

// Function to sort governors
const sortGovernors = (date) => {
  const day = date.getDay();
  if (day === 1 || day === 2) {
    governors.sort((a, b) => a.state.localeCompare(b.state));
  } else {
    governors.sort((a, b) => b.totalVotes - a.totalVotes);
  }
};

// Function to update input value with formatted date range
function updateInputValue(start, end) {
  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${date.getDate()}${getOrdinalSuffix(date.getDate())}, ${months[date.getMonth()]}`;
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  document.getElementById('weekReveal').value = `${formatDate(start)} - ${formatDate(end)}`;
}

// Debounce function to limit the frequency of function calls
function debounce(func, delay) { let timeoutId; return function (...args) { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); }; }

// Function to update weekly report
const updateWeeklyReport = async () => {
  try {
    console.log("Starting updateWeeklyReport function");

    const governorsRef = collection(db, 'governors');
    const snapshot = await getDocs(governorsRef);
    console.log("Snapshot retrieved, document count:", snapshot.size);

    let highestEngaged = null;
    let leastEngaged = null;
    let highestVoteCount = null;
    let leastVoteCount = null;

    snapshot.forEach(doc => {
      const governor = doc.data();
      governor.id = doc.id;
      console.log("Processing governor:", governor.name);

      if (!highestEngaged || governor.engagement > highestEngaged.engagement) {
        highestEngaged = governor;
      }
      if (!leastEngaged || governor.engagement < leastEngaged.engagement) {
        leastEngaged = governor;
      }
      if (!highestVoteCount || governor.totalVotes > highestVoteCount.totalVotes) {
        highestVoteCount = governor;
      }
      if (!leastVoteCount || governor.totalVotes < leastVoteCount.totalVotes) {
        leastVoteCount = governor;
      }
    });

    updateGovernorInfo('highest-engaged', highestEngaged);
    updateGovernorInfo('least-engaged', leastEngaged);
    updateGovernorInfo('highest-vote', highestVoteCount);
    updateGovernorInfo('least-vote', leastVoteCount);

    console.log("Weekly report updated successfully");
  } catch (error) {
    console.error("Error updating weekly report:", error);
  }
};

function showSkeleton() {
  document.querySelectorAll('[id$="Skeleton"]').forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll('#winnerAvatar, #winnerName, #winnerState, #winnerTotalVotes, #winnerCategories').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('[id^="highest-"], [id^="least-"]').forEach(el => el.classList.add('hidden'));
}

function hideSkeleton() {
  document.querySelectorAll('[id$="Skeleton"]').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('#winnerAvatar, #winnerName, #winnerState, #winnerTotalVotes, #winnerCategories').forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll('[id^="highest-"], [id^="least-"]').forEach(el => el.classList.remove('hidden'));
}

async function loadContent() {
  showSkeleton();
  
  try {
    // Fetch data from Firebase
    const currentMonday = getPreviousMonday(new Date());
    await fetchWeeklyResults(currentMonday);
    
    // Update winner profile
    updateWinnerProfile();
    
    // Update weekly report
    await updateWeeklyReport();
    
    // Hide skeleton and show actual content
    hideSkeleton();
  } catch (error) {
    console.error("Error loading content:", error);
    displayErrorMessage();
  }
}

function updateGovernorInfo(prefix, governor) { if (!governor) { console.log(`No governor data for ${prefix}`); return; } const imgElement = document.getElementById(`${prefix}-img`); const nameElement = document.getElementById(`${prefix}-name`); const stateElement = document.getElementById(`${prefix}-state`); const voteCountElement = document.getElementById(`${prefix}-vote-count`); if (imgElement) imgElement.src = governor.avatar || ''; if (nameElement) nameElement.textContent = governor.name || 'N/A'; if (stateElement) stateElement.textContent = governor.state || 'N/A'; if (voteCountElement) voteCountElement.textContent = governor.totalVotes || '0'; }

// Create a debounced version of updateWeeklyReport
const debouncedUpdateWeeklyReport = debounce(updateWeeklyReport, 2000);

// Function to get the previous week's winner
async function getPreviousWeekWinner() {
  try {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const daysToLastMonday = currentDay === 0 ? 7 : currentDay + 6;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToLastMonday);
    lastMonday.setHours(0, 0, 0, 0); // Set to midnight

    const docId = lastMonday.toISOString().split('T')[0]; // "YYYY-MM-DD"

    console.log("Fetching previous week winner with document ID:", docId);

    const weeklyResultRef = doc(db, 'weeklyResults', docId);
    const weeklyResultDoc = await getDoc(weeklyResultRef);

    if (weeklyResultDoc.exists()) {
      const data = weeklyResultDoc.data();
      console.log("Weekly result document data:", data);

      const winner = data.winner;
      console.log("Winner found:", winner);
      return winner;
    } else {
      console.log("No previous week result found for date:", docId);
      return null;
    }
  } catch (error) {
    console.error("Error getting previous week winner:", error);
    return null;
  }
}

//For engagement 
async function initializeEngagement() {
  const governorsRef = collection(db, 'governors');
  const snapshot = await getDocs(governorsRef);

  snapshot.forEach(async (doc) => {
    const data = doc.data();
    if (data.engagement === undefined) {
      // Initialize engagement as the sum of absolute values of all category votes
      const engagement = Object.values(data.categories || {}).reduce((sum, category) => sum + Math.abs(category.votes || 0), 0);
      await updateDoc(doc.ref, { engagement });
    }
  });

  console.log("Engagement initialization complete");
}

async function fetchLatestWeeklyResult() {
  try {
    console.log("Attempting to fetch latest weekly result...");
    const weeklyResultsRef = collection(db, 'weeklyResults');
    const q = query(weeklyResultsRef, orderBy('weekStart', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No weekly results found');
      return null;
    }

    const latestResult = snapshot.docs[0].data();
    console.log('Latest weekly result:', latestResult);
    return latestResult;
  } catch (error) {
    console.error('Error fetching latest weekly result:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return null;
  }
}

// Function to update the winner profile
  async function updateWinnerProfile() {
    console.log("Updating winner profile...");
    
    const latestResult = await fetchLatestWeeklyResult(); 
    
    if (!latestResult || !latestResult.winner) { console.log('No winner data available'); 
    setDefaultWinnerProfile(); 
    return; 
      
    } 
    const winner = latestResult.winner; 
    console.log("Winner data:", winner); 
    // Update DOM elements 
    document.getElementById('winnerAvatar').src = winner.avatar; document.getElementById('winnerName').textContent = winner.name; document.getElementById('winnerState').textContent = winner.state; document.getElementById('winnerTotalVotes').textContent = winner.totalVotes; document.getElementById('winnerInfrastructure').textContent = winner.infrastructure; document.getElementById('winnerSecurity').textContent = winner.security; document.getElementById('winnerEducation').textContent = winner.education; document.getElementById('winnerHealthcare').textContent = winner.healthcare; document.getElementById('winnerJobs').textContent = winner.jobs; }
  
  
  
  
  
  

function setDefaultWinnerProfile() {
  document.getElementById('winner-avatar').src = '';
  document.getElementById('winner-name').textContent = "No winner data available";
  document.getElementById('winner-state').textContent = "";
  document.getElementById('winner-votes').textContent = "0";
  document.getElementById('winner-totalVotes').textContent = "0 reviews";
}

// Function to initialize date picker and week reveal
const initializeDatePicker = () => {
  const datePicker = document.getElementById('datePicker');
  const weekReveal = document.getElementById('weekReveal');

  if (!datePicker || !weekReveal) {
    console.error('Datepicker or WeekReveal element not found');
    return;
  }

  const today = new Date();
  datePicker.max = today.toISOString().split('T')[0];
  
  // Set the datepicker to today's date
  datePicker.valueAsDate = today;

  const [start, end] = getWeekRange(today);
  updateInputValue(start, end);

  fetchWeeklyResults(today);

  datePicker.addEventListener('change', (event) => {
    const selectedDate = event.target.valueAsDate;
    console.log('Selected date:', selectedDate);
    const [start, end] = getWeekRange(selectedDate);
    updateInputValue(start, end);
    fetchWeeklyResults(selectedDate);
  });
};

// Function to get the previous Monday
function getPreviousMonday(date) {
    const prevMonday = new Date(date);
    prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7);
    prevMonday.setHours(0, 0, 0, 0);
    return prevMonday;
}

// Function to fetch weekly results
async function fetchWeeklyResults(selectedDate) {
  try {
    const mondayOfWeek = getPreviousMonday(selectedDate);
    console.log("Fetching results for week starting:", mondayOfWeek);

    const governorsRef = collection(db, 'governors');
    const q = query(governorsRef);  // Remove the where clause to fetch all governors

    const snapshot = await getDocs(q);
    console.log("Fetched documents:", snapshot.size);

    if (snapshot.empty) {
      console.log('No matching documents.');
      displayNoResultsMessage();
      return;
    }

    const results = snapshot.docs.map(doc => {
      const data = doc.data();
      return new Governor(
        doc.id,
        0, // rank will be set later
        data.name,
        data.avatar,
        data.state,
        data.infrastructure,
        data.security,
        data.education,
        data.healthcare,
        data.jobs,
        data.weekStartDate?.toDate() || new Date(),  // Use current date if weekStartDate is not set
        data.totalVotes || 0,
        data.engagement || 0
      );
    });

    // Sort results and assign ranks
    results.sort((a, b) => b.totalVotes - a.totalVotes);
    results.forEach((governor, index) => {
      governor.rank = index + 1;
    });

    console.log("Processed results:", results);

    displayWeeklyResults(results, true);
    governors = results; // Store the Governor objects globally
  } catch (error) {
    console.error("Error fetching weekly results:", error);
    displayErrorMessage();
  }
}

function displayWeeklyResults(results, isCurrentWeek) {
    const governorRows = document.getElementById('governor-rows');
    governorRows.innerHTML = ''; // Clear existing rows

    if (results.length === 0) {
        displayNoResultsMessage();
        return;
    }

    results.forEach(governor => {
        const row = document.createElement('tr');
        row.className = "bg-gray-800 border-b border-gray-700 hover:bg-gray-700";
        row.innerHTML = `
            <td class="p-4">${governor.rank}</td>
            <th scope="row" class="flex items-center px-6 py-4 text-white whitespace-nowrap">
                <img class="w-10 h-10 rounded-full" src="${governor.image}" alt="${governor.name}">
                <div class="pl-3">
                    <div class="text-base font-semibold">${governor.name}</div>
                    <div class="font-normal text-gray-400">${governor.state}</div>
                </div>
            </th>
            ${createVoteCell('infrastructure', governor, isCurrentWeek)}
            ${createVoteCell('security', governor, isCurrentWeek)}
            ${createVoteCell('education', governor, isCurrentWeek)}
            ${createVoteCell('healthcare', governor, isCurrentWeek)}
            ${createVoteCell('jobs', governor, isCurrentWeek)}
            <td class="px-6 py-4">
                <span id="total-votes-${governor.rank}">${governor.totalVotes}</span>
            </td>
            <td class="px-6 py-4">
                <span id="engagement-${governor.rank}">${governor.engagement}</span>
            </td>
        `;
        governorRows.appendChild(row);
    });

    if (isCurrentWeek) {
        addVotingEventListeners();
    }
}

function createVoteCell(category, governor, isCurrentWeek) {
    if (isCurrentWeek) {
        return `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <button id="downvote-${category}-${governor.rank}" class="vote-btn downvote-btn p-1 me-3" data-id="${governor.id}" data-category="${category}" type="button">
                        <i class="bi bi-dash-circle-fill text-2xl"></i>
                    </button>
                    <span id="votes-${category}-${governor.rank}" class="votes-count">${governor.categories[category].votes}</span>
                    <button id="upvote-${category}-${governor.rank}" class="vote-btn upvote-btn p-1 ms-3" data-id="${governor.id}" data-category="${category}" type="button">
                        <i class="bi bi-plus-circle-fill text-2xl"></i>
                    </button>
                </div>
            </td>
        `;
    } else {
        return `<td class="px-6 py-4">${governor.categories[category].votes}</td>`;
    }
}

function addVotingEventListeners() {
    document.querySelectorAll('.vote-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            const category = button.dataset.category;
            const type = button.classList.contains('upvote-btn') ? 'upvote' : 'downvote';
            const governor = governors.find(g => g.id === id);
            if (governor) {
                await governor.vote(category, type);
                updateGovernorDisplay(governor);
            }
        });
    });
}

function displayNoResultsMessage() {
  const governorRows = document.getElementById('governor-rows');
  governorRows.innerHTML = `
    <tr class="bg-gray-800 border-b border-gray-700">
      <td colspan="9" class="px-6 py-4 text-center text-gray-400">No results found for this week.</td>
    </tr>
  `;
}

function displayErrorMessage() {
  const governorRows = document.getElementById('governor-rows');
  governorRows.innerHTML = `
    <tr class="bg-gray-800 border-b border-gray-700">
      <td colspan="9" class="px-6 py-4 text-center text-gray-400">An error occurred while fetching results. Please try again later.</td>
    </tr>
  `;
}

function isDateInCurrentWeek(date) {
  const today = new Date();
  const currentMonday = getPreviousMonday(today);
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  return date >= currentMonday && date < nextMonday;
}

function updateGovernorDisplay(governor) {
    Object.keys(governor.categories).forEach(category => {
        const voteCount = document.querySelector(`#votes-${category}-${governor.rank}`);
        if (voteCount) voteCount.textContent = governor.categories[category].votes;

        const upvoteBtn = document.querySelector(`#upvote-${category}-${governor.rank}`);
        const downvoteBtn = document.querySelector(`#downvote-${category}-${governor.rank}`);

        if (upvoteBtn) upvoteBtn.style.color = governor.categories[category].userVote === 'upvoted' ? 'blue' : '';
        if (downvoteBtn) downvoteBtn.style.color = governor.categories[category].userVote === 'downvoted' ? 'red' : '';
    });

    const totalVotesElement = document.querySelector(`#total-votes-${governor.rank}`);
    if (totalVotesElement) totalVotesElement.textContent = governor.totalVotes;

    const engagementElement = document.querySelector(`#engagement-${governor.rank}`);
    if (engagementElement) engagementElement.textContent = governor.engagement;
}

// Call loadContent when the page loads
document.addEventListener('DOMContentLoaded', loadContent);

// Main function to run when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await initializeEngagement();
    initializeDatePicker();
    await renderGovernors(new Date()); // Pass current date to render current week's data
    console.log("DOM fully loaded and parsed"); updateWinnerProfile();
    await updateWeeklyReport();
    
  await fetchWeeklyResults(new Date());
    
    // Add search functionality
    const searchInput = document.getElementById('table-search'); 
    const debouncedSearch = debounce(function() { 
      const searchTerm = this.value.toLowerCase(); 
      const rows = document.querySelectorAll('#governor-rows tr'); 
      rows.forEach(row => { 
        const name = row.querySelector('th div.text-base').textContent.toLowerCase(); 
        const state = row.querySelector('th div.font-normal').textContent.toLowerCase(); 
        row.style.display = (name.includes(searchTerm) || state.includes(searchTerm)) ? '' : 'none'; }); }, 300); 
        searchInput.addEventListener('input', debouncedSearch); });

// Export functions that might be needed elsewhere
export { renderGovernors, updateWinnerProfile };
