// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where, orderBy, limit, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
    constructor(id, rank, name, image, state, infrastructure, security, education, healthcare, jobs, weekStartDate, totalVotes) {
        this.id = id;
        this.rank = rank;
        this.name = name;
        this.image = image;
        this.state = state;
        this.weekStartDate = weekStartDate;
        this.totalVotes = totalVotes || 0;
        this.categories = {
            infrastructure: { votes: parseInt(infrastructure) || 0, userVote: null },
            security: { votes: parseInt(security) || 0, userVote: null },
            education: { votes: parseInt(education) || 0, userVote: null },
            healthcare: { votes: parseInt(healthcare) || 0, userVote: null },
            jobs: { votes: parseInt(jobs) || 0, userVote: null },
        };
    }

    async vote(category, type) {
        const categoryData = this.categories[category];
        if (type === 'upvote') {
            if (categoryData.userVote === 'upvoted') {
                categoryData.votes -= 1;
                categoryData.userVote = null;
                this.totalVotes -= 1;
            } else {
                if (categoryData.userVote === 'downvoted') {
                    categoryData.votes += 1;
                    this.totalVotes += 1;
                }
                categoryData.votes += 1;
                categoryData.userVote = 'upvoted';
                this.totalVotes += 1;
            }
        } else if (type === 'downvote') {
            if (categoryData.userVote === 'downvoted') {
                categoryData.votes += 1;
                categoryData.userVote = null;
                this.totalVotes += 1;
            } else {
                if (categoryData.userVote === 'upvoted') {
                    categoryData.votes -= 1;
                    this.totalVotes -= 1;
                }
                categoryData.votes -= 1;
                categoryData.userVote = 'downvoted';
                this.totalVotes -= 1;
            }
        }
        this.updateVotesDisplay(category);
        const governorRef = doc(db, 'governors', this.id);
        await updateDoc(governorRef, {
            [category]: categoryData.votes,
            totalVotes: this.totalVotes,
            weekStartDate: this.weekStartDate
        });

        // Call the debounced update function after voting
        debouncedUpdateWeeklyReport();
    }

    updateVotesDisplay(category) {
        const categoryData = this.categories[category];
        document.querySelector(`#votes-${category}-${this.rank}`).textContent = categoryData.votes;
        const upvoteBtn = document.querySelector(`#upvote-${category}-${this.rank}`);
        const downvoteBtn = document.querySelector(`#downvote-${category}-${this.rank}`);
        upvoteBtn.style.color = categoryData.userVote === 'upvoted' ? 'blue' : '';
        downvoteBtn.style.color = categoryData.userVote === 'downvoted' ? 'red' : '';
        document.querySelector(`#total-votes-${this.rank}`).textContent = this.totalVotes;
    }

    render() {
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
            </tr>
        `;
    }
}

// Array to store governor objects
let governors = [];

// Function to get week range (Monday to Sunday)
function getWeekRange(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Sunday
    return [start, end];
}

// Function to get the previous week's date range
function getPreviousWeekRange(date) {
    const end = new Date(date);
    end.setDate(end.getDate() - ((end.getDay() + 6) % 7) - 1); // Previous Sunday
    const start = new Date(end);
    start.setDate(start.getDate() - 6); // Previous Monday
    return [start, end];
}

// Function to render governors
const renderGovernors = async (selectedDate) => {
    const governorsRef = collection(db, 'governors');
    const governorRows = document.getElementById('governor-rows');
    try {
        let q;
        if (selectedDate) {
            const [weekStart, weekEnd] = getWeekRange(selectedDate);
            q = query(governorsRef, where("weekStartDate", ">=", weekStart), where("weekStartDate", "<=", weekEnd));
        } else {
            q = query(governorsRef);
        }
        const snapshot = await getDocs(q);
        governors = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const governor = new Governor(
                doc.id,
                data.rank,
                data.name,
                data.avatar,
                data.state,
                data.infrastructure,
                data.security,
                data.education,
                data.healthcare,
                data.jobs,
                data.weekStartDate?.toDate(),
                data.totalVotes
            );
            governors.push(governor);
        });

        // Sort governors based on the current day
        sortGovernors(selectedDate || new Date());

        // Clear existing rows
        governorRows.innerHTML = '';

        // Render sorted governors
        governors.forEach((governor, index) => {
            governor.rank = index + 1;
            governorRows.innerHTML += governor.render();
        });

        // Add event listeners for voting buttons
        document.querySelectorAll('.vote-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const rank = button.dataset.id;
                const category = button.dataset.category;
                const type = button.classList.contains('upvote-btn') ? 'upvote' : 'downvote';
                const governor = governors.find(g => g.rank == rank);
                await governor.vote(category, type);

                // Re-sort governors if it's Wednesday to Sunday
                const currentDay = new Date().getDay();
                if (currentDay >= 3 || currentDay === 0) {
                    sortGovernors(new Date());
                    renderGovernors(selectedDate);
                }
            });
        });

        // Update weekly report after rendering governors
        updateWeeklyReport();
    } catch (error) {
        console.error("Error fetching governors:", error);
    }
};

// Function to sort governors
const sortGovernors = (date) => {
    const day = date.getDay();
    if (day === 1 || day === 2) {
        // Monday or Tuesday
        governors.sort((a, b) => a.state.localeCompare(b.state));
    } else {
        // Wednesday to Sunday
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
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    };

    document.getElementById('weekReveal').value = `${formatDate(start)} - ${formatDate(end)}`;
}

// Function to store weekly results
async function storeWeeklyResults(weekStart, weekEnd) {
    const governorsRef = collection(db, 'governors');
    const weeklyResultsRef = collection(db, 'weeklyResults');

    // Get all governors' data for the week
    const governorsSnapshot = await getDocs(governorsRef);
    const weeklyResults = governorsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            state: data.state,
            avatar: data.avatar,
            totalVotes: data.totalVotes || 0,
            infrastructure: data.infrastructure || 0,
            security: data.security || 0,
            education: data.education || 0,
            healthcare: data.healthcare || 0,
            jobs: data.jobs || 0
        };
    });

    // Sort to find the winner
    weeklyResults.sort((a, b) => b.totalVotes - a.totalVotes);
    const winner = weeklyResults[0];

    // Store in weeklyResults collection
    await addDoc(weeklyResultsRef, {
        weekStart: weekStart,
        weekEnd: weekEnd,
        results: weeklyResults,
        winner: winner
    });
}

// Function to reset votes at the start of each week (Monday)
const resetVotes = async () => {
    const today = new Date();
    if (today.getDay() === 1) { // Monday
        const weekStart = new Date(today);
        weekStart.setHours(0, 0, 0, 0);

        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const lastWeekEnd = new Date(weekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        lastWeekEnd.setHours(23, 59, 59, 999);

        // Store last week's results
        await storeWeeklyResults(lastWeekStart, lastWeekEnd);

        for (let governor of governors) {
            for (let category in governor.categories) {
                governor.categories[category].votes = 0;
                governor.categories[category].userVote = null;
            }
            governor.totalVotes = 0;
            // Update Firestore
            const governorRef = doc(db, 'governors', governor.id);
            await updateDoc(governorRef, {
                infrastructure: 0,
                security: 0,
                education: 0,
                healthcare: 0,
                jobs: 0,
                totalVotes: 0,
                weekStartDate: weekStart
            });
        }
        await renderGovernors();
        await updateWinnerProfile();
    }
};

// Debounce function to limit the frequency of function calls
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}
  
  // Function to update weekly report
const updateWeeklyReport = () => {
    const updateElement = (imgId, nameId, stateId, data) => {
        const imgElement = document.getElementById(imgId);
        if (imgElement) imgElement.src = data.image;

        const nameElement = document.getElementById(nameId);
        if (nameElement) nameElement.textContent = data.name;

        const stateElement = document.getElementById(stateId);
        if (stateElement) stateElement.textContent = data.state;
    };

    const highestEngaged = governors.reduce((max, gov) => gov.totalVotes > max.totalVotes ? gov : max, governors[0]);
    const leastEngaged = governors.reduce((min, gov) => gov.totalVotes < min.totalVotes ? gov : min, governors[0]);
    const highestVoteCount = governors.reduce((max, gov) => gov.totalVotes > max.totalVotes ? gov : max, governors[0]);
    const leastVoteCount = governors.reduce((min, gov) => gov.totalVotes < min.totalVotes ? gov : min, governors[0]);

    updateElement("highest-engaged-img", "highest-engaged-name", "highest-engaged-state", highestEngaged);
    updateElement("least-engaged-img", "least-engaged-name", "least-engaged-state", leastEngaged);
    updateElement("highest-vote-img", "highest-vote-name", "highest-vote-state", highestVoteCount);
    updateElement("least-vote-img", "least-vote-name", "least-vote-state", leastVoteCount);
};

// Create a debounced version of updateWeeklyReport
const debouncedUpdateWeeklyReport = debounce(updateWeeklyReport, 2000); // 2 seconds delay

// Function to get the previous week's winner
async function getPreviousWeekWinner() {
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    const weeklyResultsRef = collection(db, 'weeklyResults');
    const q = query(
        weeklyResultsRef,
        where("weekStart", "==", lastWeekStart),
        limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const weekData = querySnapshot.docs[0].data();
        return weekData.winner;
    }
    return null;
}

// Function to update the winner profile
async function updateWinnerProfile() {
    const winner = await getPreviousWeekWinner();
    if (winner) {
        document.getElementById('prev-winner-img').src = winner.avatar;
        document.getElementById('prev-winner-name').textContent = winner.name;
        document.getElementById('prev-winner-state').textContent = winner.state;
        document.getElementById('prev-winner-vote-count').textContent = winner.totalVotes;
        
        const totalReviews = ['infrastructure', 'security', 'education', 'healthcare', 'jobs']
            .reduce((sum, category) => sum + Math.abs(winner[category]), 0);
        document.getElementById('prev-winner-reviews').textContent = `${totalReviews} reviews`;
    } else {
        console.log("No winner found for the previous week");
    }
}

// Function to initialize date picker and week reveal
const initializeDatePicker = () => {
    const datePicker = document.getElementById('datePicker');
    const weekReveal = document.getElementById('weekReveal');

    // Set current date on page load
    const today = new Date();
    datePicker.valueAsDate = today;

    // Update week reveal on page load
    const [start, end] = getWeekRange(today);
    updateInputValue(start, end);

    // Add event listener for date picker changes
    datePicker.addEventListener('change', (event) => {
        const selectedDate = event.target.valueAsDate;
        const [start, end] = getWeekRange(selectedDate);
        updateInputValue(start, end);
        renderGovernors(selectedDate);
    });
};

// Main function to run when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    renderGovernors();
    updateWinnerProfile();

    // Add search functionality
    const searchInput = document.getElementById('table-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#governor-rows tr');
        rows.forEach(row => {
            const name = row.querySelector('th div.text-base').textContent.toLowerCase();
            const state = row.querySelector('th div.font-normal').textContent.toLowerCase();
            if (name.includes(searchTerm) || state.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Reset votes at the start of each week
    resetVotes();
});

// Export functions that might be needed elsewhere
export { renderGovernors, updateWinnerProfile, resetVotes };
