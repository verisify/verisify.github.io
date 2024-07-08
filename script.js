// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
    constructor(id, rank, name, image, state, infrastructure, security, education, healthcare, jobs, weekStartDate) {
        this.id = id;
        this.rank = rank;
        this.name = name;
        this.image = image;
        this.state = state;
        this.weekStartDate = weekStartDate;
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
            } else {
                if (categoryData.userVote === 'downvoted') {
                    categoryData.votes += 1;
                }
                categoryData.votes += 1;
                categoryData.userVote = 'upvoted';
            }
        } else if (type === 'downvote') {
            if (categoryData.userVote === 'downvoted') {
                categoryData.votes += 1;
                categoryData.userVote = null;
            } else {
                if (categoryData.userVote === 'upvoted') {
                    categoryData.votes -= 1;
                }
                categoryData.votes -= 1;
                categoryData.userVote = 'downvoted';
            }
        }
        this.updateVotesDisplay(category);
        const governorRef = doc(db, 'governors', this.id);
        await updateDoc(governorRef, {
            [category]: categoryData.votes,
            weekStartDate: this.weekStartDate
        });
    }

    updateVotesDisplay(category) {
        const categoryData = this.categories[category];
        document.querySelector(`#votes-${category}-${this.rank}`).textContent = categoryData.votes;
        const upvoteBtn = document.querySelector(`#upvote-${category}-${this.rank}`);
        const downvoteBtn = document.querySelector(`#downvote-${category}-${this.rank}`);
        upvoteBtn.style.color = categoryData.userVote === 'upvoted' ? 'blue' : '';
        downvoteBtn.style.color = categoryData.userVote === 'downvoted' ? 'red' : '';
        const totalVotes = this.calculateTotalVotes();
        document.querySelector(`#total-votes-${this.rank}`).textContent = totalVotes;
    }

    calculateTotalVotes() {
        return Object.values(this.categories).reduce((sum, category) => sum + category.votes, 0);
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
                    <span id="total-votes-${this.rank}">${this.calculateTotalVotes()}</span>
                </td>
            </tr>
        `;
    }
}

// Array to store governor objects
let governors = [];

// Function to render governors
const renderGovernors = async (selectedDate) => {
    const governorsRef = collection(db, 'governors');
    const governorRows = document.getElementById('governor-rows');
    try {
        let q;
        if (selectedDate) {
            const weekStart = new Date(selectedDate);
            weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Set to Monday
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // Set to Sunday
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
                data.weekStartDate?.toDate()
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
                    renderGovernors();
                }
            });
        });

        // Add click event listener for row hover effect
        document.querySelectorAll('#governor-rows tr').forEach(row => {
            row.addEventListener('click', function() {
                document.querySelectorAll('#governor-rows tr').forEach(r => r.classList.remove('row-clicked'));
                this.classList.add('row-clicked');
            });
        });

        // Disable voting for past weeks
        const today = new Date();
        const currentWeekStart = new Date(today.setDate(today.getDate() - ((today.getDay() + 6) % 7)));
        if (selectedDate < currentWeekStart) {
            document.querySelectorAll('.vote-btn').forEach(button => {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            });
        }

        // Update weekly report
        updateWeeklyReport();

        // Update winner profile
        updateWinnerProfile();
    } catch (error) {
        console.error("Error fetching governors:", error);
        console.error("Detailed error:", error.message); // Add this line to get more details
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
        governors.sort((a, b) => b.calculateTotalVotes() - a.calculateTotalVotes());
    }
};

// Function to get week range (Monday to Sunday)
function getWeekRange(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Sunday
    return [start, end];
}

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

// Function to reset votes at the start of each week (Monday)
const resetVotes = async () => {
    const today = new Date();
    if (today.getDay() === 1) { // Monday
        const weekStart = new Date(today);
        weekStart.setHours(0, 0, 0, 0);
        for (let governor of governors) {
            for (let category in governor.categories) {
                governor.categories[category].votes = 0;
                governor.categories[category].userVote = null;
            }
            // Update Firestore
            const governorRef = doc(db, 'governors', governor.id);
            await updateDoc(governorRef, {
                infrastructure: 0,
                security: 0,
                education: 0,
                healthcare: 0,
                jobs: 0,
                weekStartDate: weekStart
            });
        }
        renderGovernors();
    }
};

// Function to update weekly report
const updateWeeklyReport = () => {
    const day = new Date().getDay();
    if (day >= 2 || day === 0) { // Tuesday to Sunday
        const sortedGovernors = [...governors].sort((a, b) => b.calculateTotalVotes() - a.calculateTotalVotes());
        
        // Highest engaged
        const highestEngaged = sortedGovernors[0];
        document.querySelector('.weekly-report .image-one').src = highestEngaged.image;
        document.querySelector('.weekly-report .governor-one').textContent = highestEngaged.name;
        document.querySelector('.weekly-report .state-1').textContent = highestEngaged.state;

        // Lowest engaged
        const lowestEngaged = sortedGovernors[sortedGovernors.length - 1];
        document.querySelector('.weekly-report .image-two').src = lowestEngaged.image;
        document.querySelector('.weekly-report .governor-two').textContent = lowestEngaged.name;
        document.querySelector('.weekly-report .state-2').textContent = lowestEngaged.state;

        // Highest upvotes
        const highestUpvotes = [...governors].sort((a, b) => 
            b.categories.infrastructure.votes + b.categories.security.votes + b.categories.education.votes + 
            b.categories.healthcare.votes + b.categories.jobs.votes - 
            (a.categories.infrastructure.votes + a.categories.security.votes + a.categories.education.votes + 
            a.categories.healthcare.votes + a.categories.jobs.votes)
        )[0];
        document.querySelector('.weekly-report .image-three').src = highestUpvotes.image;
        document.querySelector('.weekly-report .governor-three').textContent = highestUpvotes.name;
        document.querySelector('.weekly-report .state-3').textContent = highestUpvotes.state;

        // Lowest upvotes
        const lowestUpvotes = [...governors].sort((a, b) => 
            a.categories.infrastructure.votes + a.categories.security.votes + a.categories.education.votes + 
            a.categories.healthcare.votes + a.categories.jobs.votes - 
            (b.categories.infrastructure.votes + b.categories.security.votes + b.categories.education.votes + 
            b.categories.healthcare.votes + b.categories.jobs.votes)
        )[0];
        document.querySelector('.weekly-report .image-four').src = lowestUpvotes.image;
        document.querySelector('.weekly-report .governor-four').textContent = lowestUpvotes.name;
        document.querySelector('.weekly-report .state-4').textContent = lowestUpvotes.state;
    }
};

// Function to update winner profile
const updateWinnerProfile = async () => {
    const today = new Date();
    const lastWeekEnd = new Date(today.setDate(today.getDate() - today.getDay() - 1));
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekStart.getDate() - 6);

    const q = query(collection(db, 'governors'), 
                    where('weekStartDate', '>=', lastWeekStart), 
                    where('weekStartDate', '<=', lastWeekEnd),
                    orderBy('weekStartDate', 'desc'),
                    limit(1));

    try {
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const winnerData = snapshot.docs[0].data();
            const winner = new Governor(
                snapshot.docs[0].id,
                winnerData.rank,
                winnerData.name,
                winnerData.avatar,
                winnerData.state,
                winnerData.infrastructure,
                winnerData.security,
                winnerData.education,
                winnerData.healthcare,
                winnerData.jobs,
                winnerData.weekStartDate?.toDate()
            );

            document.querySelector('.winner-profile .winner-image').src = winner.image;
            document.querySelector('.winner-profile .governor-winner').textContent = winner.name;
            document.querySelector('.winner-profile .state-winner').textContent = winner.state;
            
            const totalUpvotes = winner.calculateTotalVotes();
            document.querySelector('.winner-profile .upvote-count').textContent = totalUpvotes;

            const totalReviews = Object.values(winner.categories).reduce((sum, category) => 
                sum + Math.abs(category.votes), 0);
            document.querySelector('.winner-profile .total-reviews').textContent = totalReviews;
        }
    } catch (error) {
        console.error("Error fetching winner profile:", error);
    }
};

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

    // Add search functionality
    const searchInput = document.getElementById('table-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#governor-rows tr');
        rows.forEach(row => {
            const name = row.querySelector('th div:first-child').textContent.toLowerCase();
            const state = row.querySelector('th div:last-child').textContent.toLowerCase();
            if (name.includes(searchTerm) || state.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Navigation bar functionality
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');
    const signInButton = document.getElementById('sign-in');

    // Assuming we have a way to check if the user is signed in
    const userSignedIn = false; // Change this based on user state

    if (userSignedIn) {
        userMenuButton.style.display = 'block';
        signInButton.style.display = 'none';
    } else {
        userMenuButton.style.display = 'none';
        signInButton.style.display = 'block';
    }

    userMenuButton.addEventListener('click', () => {
        userDropdown.classList.toggle('hidden');
    });

    // Initial render of governors
    renderGovernors();

    // Call resetVotes function daily
    setInterval(resetVotes, 24 * 60 * 60 * 1000); // Check every 24 hours

    // Initial call to resetVotes
    resetVotes();
});
