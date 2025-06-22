// static/js/dashboard_logic.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("DEBUG: dashboard_logic.js DOMContentLoaded fired."); // New debug line

    // Set the dynamic greeting based on time of day
    setDynamicGreeting();

    // --- Search Bar Functionality ---
    const searchInputWrapper = document.getElementById("searchInputWrapper"); // New ID for the input box container
    const searchInput = document.getElementById("searchInput"); // ID for the input field
    const searchIcon = document.getElementById("search-toggle-icon"); // ID for the static search icon


    if (searchIcon && searchInputWrapper && searchInput) { // Ensure all elements are found
        searchIcon.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent clicks from bubbling up

            // Toggle expanded class on the input wrapper
            if (searchInputWrapper.classList.contains("expanded")) {
                searchInputWrapper.classList.remove("expanded");
                searchInput.blur(); // Remove focus when collapsed
                searchInput.setAttribute("tabindex", "-1"); // Make unfocusable
                searchInput.value = ""; // Clear input on collapse
                // Hide search results when collapsing
                const searchResultsDisplay = document.getElementById("search-results-display");
                if (searchResultsDisplay) {
                    searchResultsDisplay.classList.add("hidden");
                    searchResultsDisplay.innerHTML = ""; // Clear previous results
                }
            } else {
                searchInputWrapper.classList.add("expanded");
                searchInput.focus(); // Focus input when expanded
                searchInput.setAttribute("tabindex", "0"); // Make focusable
            }
        });

        // Optional: Hide search when clicking outside
        document.body.addEventListener("click", (event) => {
            // Check if the click was outside the search input wrapper AND outside the search icon
            // and the search input wrapper is currently expanded.
            const isClickOutsideWrapper = !searchInputWrapper.contains(event.target);
            const isClickOutsideIcon = !searchIcon.contains(event.target); // Check if click was on the icon itself

            if (searchInputWrapper.classList.contains("expanded") && isClickOutsideWrapper && isClickOutsideIcon) {
                searchInputWrapper.classList.remove("expanded");
                searchInput.blur();
                searchInput.setAttribute("tabindex", "-1");
                searchInput.value = "";
                // Hide search results when collapsing
                const searchResultsDisplay = document.getElementById("search-results-display");
                if (searchResultsDisplay) {
                    searchResultsDisplay.classList.add("hidden");
                    searchResultsDisplay.innerHTML = ""; // Clear previous results
                }
            }
        });

        // Handle Escape key to collapse search
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                searchInputWrapper.classList.remove("expanded");
                searchInput.blur();
                searchInput.setAttribute("tabindex", "-1");
                searchInput.value = "";
                // Hide search results when collapsing
                const searchResultsDisplay = document.getElementById("search-results-display");
                if (searchResultsDisplay) {
                    searchResultsDisplay.classList.add("hidden");
                    searchResultsDisplay.innerHTML = ""; // Clear previous results
                }
            }
        });

        // Handle Enter key for search
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent default form submission
                performWebsiteSearch(searchInput.value);
            }
        });

        // Initialize state if input has value on page load
        if (searchInput.value !== "") {
            searchInputWrapper.classList.add("expanded");
            searchInput.setAttribute("tabindex", "0"); // Ensure it's focusable if pre-filled
        }

    } else {
        console.warn("Search bar elements not found. Search functionality might not work.");
    }

    // Leaderboard fetch and render logic
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.leaderboard) {
          const tbody = document.getElementById('leaderboard-body');
          if (tbody) {
            tbody.innerHTML = '';
            data.leaderboard.forEach(user => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td>${user.rank}</td>
                <td${user.is_current_user ? ' class="accent-yellow font-weight-700"' : ''}>${user.username}</td>
                <td class="text-right">${user.points}</td>
              `;
              tbody.appendChild(tr);
            });
          }
        }
      });
});

/**
 * Sets the greeting message (Good morning, Good afternoon, Good evening) based on the current time.
 */
function setDynamicGreeting() {
    console.log("DEBUG: setDynamicGreeting() function called."); // New debug line

    const timeBasedGreetingElement = document.getElementById("time-based-greeting");
    if (!timeBasedGreetingElement) {
        console.warn("WARNING: Element with ID 'time-based-greeting' not found. Cannot set dynamic greeting.");
        return;
    }
    console.log("DEBUG: 'time-based-greeting' element found:", timeBasedGreetingElement); // New debug line


    const currentHour = new Date().getHours();
    console.log("DEBUG: Current hour is:", currentHour); // New debug line

    let greeting = "Good day"; // Default

    if (currentHour >= 5 && currentHour < 12) {
        greeting = "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    timeBasedGreetingElement.textContent = greeting + ",";
    console.log("DEBUG: Greeting set to:", greeting); // New debug line
}

/**
 * Placeholder function for website search.
 * This function now updates a dedicated search results display area on the dashboard.
 * @param {string} query The search query entered by the user.
 */
function performWebsiteSearch(query) {
    console.log("DEBUG: Performing website search for query:", query);
    const searchResultsDisplay = document.getElementById("search-results-display");

    if (query.trim() === "") {
        searchResultsDisplay.classList.add("hidden");
        searchResultsDisplay.innerHTML = "";
        return; // Do nothing if query is empty
    }

    // Show the search results container
    searchResultsDisplay.classList.remove("hidden");
    searchResultsDisplay.innerHTML = `<h3>Search Results for "${query}" <span class="material-symbols-outlined">search</span></h3>`;
    searchResultsDisplay.innerHTML += `<p>Searching for: "${query}"...</p>`;
    searchResultsDisplay.innerHTML += "<p>Actual search logic would be implemented here, potentially fetching results from an API or filtering existing content.</p>";
    searchResultsDisplay.innerHTML += "<p>For now, this is a placeholder. You would replace this with real search results.</p>";

    // In a real application, you'd likely fetch results or filter visible content.
    // Example:
    // fetch(`/api/search?q=${encodeURIComponent(query)}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         // Render actual search results here
    //         searchResultsDisplay.innerHTML = `<h3>Search Results for "${query}"</h3>`;
    //         if (data.results && data.results.length > 0) {
    //             let resultsHtml = '<ul>';
    //             data.results.forEach(item => {
    //                 resultsHtml += `<li><a href="${item.url}">${item.title}</a> - ${item.description}</li>`;
    //             });
    //             resultsHtml += '</ul>';
    //             searchResultsDisplay.innerHTML += resultsHtml;
    //         } else {
    //             searchResultsDisplay.innerHTML += '<p>No results found.</p>';
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error during search:', error);
    //         searchResultsDisplay.innerHTML += '<p>Error performing search. Please try again.</p>';
    //     });
}

// Confetti animation for leaderboard block (randomized circles/rects, more pieces, longer, all directions, slow fall)
let confettiSeed = 0;
function launchConfetti() {
    const block = document.getElementById("leaderboard-block");
    if (!block) return;
    const confetti = document.createElement("div");
    confetti.className = "confetti-container";
    // Use a new seed for every click for different behavior
    confettiSeed = (confettiSeed + 1) % 100000;
    const rand = (min, max) => {
        confettiSeed = (confettiSeed * 9301 + 49297) % 233280;
        const rnd = confettiSeed / 233280;
        return min + rnd * (max - min);
    };
    const numConfetti = 220 + Math.floor(Math.random() * 60); // More confetti
    for (let i = 0; i < numConfetti; i++) {
        const isCircle = Math.random() < 0.6;
        const piece = document.createElement("div");
        piece.className = "confetti-piece" + (isCircle ? " confetti-circle" : " confetti-rect");
        // Randomize size
        let size = rand(10, 22);
        if (isCircle) {
            piece.style.width = size + "px";
            piece.style.height = size + "px";
        } else {
            piece.style.width = rand(8, 18) + "px";
            piece.style.height = rand(12, 24) + "px";
        }
        // Randomize color
        piece.style.background = `hsl(${rand(0,360)},90%,${rand(50,70)}%)`;
        // Randomize initial position inside the block
        piece.style.left = rand(5, 95) + "%";
        piece.style.top = rand(5, 70) + "%";
        // Randomize rotation
        piece.style.transform = `rotate(${rand(0,360)}deg)`;
        // Animation: explode in all directions, then fall to bottom
        const angle = rand(0, 2 * Math.PI); // All directions
        const explodeDist = rand(120, 320); // More dramatic explosion
        const fallDist = window.innerHeight * 0.7 + rand(40, 120); // Fall to bottom of site
        piece.style.setProperty("--dx", Math.cos(angle) * explodeDist + "px");
        piece.style.setProperty("--dy", Math.sin(angle) * explodeDist + fallDist + "px");
        // Longer animation duration for slow fall
        const duration = rand(2.8, 4.2);
        piece.style.animation = `confetti-fly ${duration}s cubic-bezier(.62,.04,.36,1.02) forwards`;
        piece.style.animationDelay = rand(0, 0.35) + "s";
        confetti.appendChild(piece);
    }
    block.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
}
document.addEventListener("DOMContentLoaded", function() {
    const block = document.getElementById("leaderboard-block");
    if (block) {
        block.addEventListener("click", launchConfetti);
    }
});

// Rotating Python Nuggets Block (15 min rotation, Python interpreter)
const nuggets = [
    {
        title: "Type Savvy Python!",
        text: "Did you know Python's super intuitive? It automatically figures out if your variable is text (str), a whole number (int), a decimal (float), or a truth statement (bool). Curious? Just use type(your_variable) to confirm its data type!<br>✨ <b>Try This Out:</b> <code>temperature = 98.6; type(temperature)</code>"
    },
    {
        title: "Data Type Acrobatics!",
        text: "Did you know you can instantly switch a variable's data type in Python? int(\"123\") turns a string into an integer, while str(42) converts a number to text. It's like data transformation on the fly!<br>✨ <b>Try This Out:</b> <code>age_str = \"30\"; int(age_str) + 5</code>"
    },
    {
        title: "String Slicing Secrets!",
        text: "Did you know you can precisely grab parts of a string? Indexing (my_string[0]) gets a single character, while slicing (my_string[1:5]) extracts a whole section. Perfect for targeted text manipulation!<br>✨ <b>Try This Out:</b> <code>vehicle = \"Spaceship\"; vehicle[0:5]</code>"
    },
    {
        title: "List Power Unleashed!",
        text: "Did you know Python lists ([]) are your go-to for ordered collections? They can hold diverse data types and boast handy methods like .append() to add, .sort() to organize, and min()/max() to find extremes!<br>✨ <b>Try This Out:</b> <code>scores = [88, 92, 75]; scores.append(95); scores.sort(); scores</code>"
    },
    {
        title: "Operator Order is Key!",
        text: "Did you know Python follows an \"order of operations\" (think PEMDAS/BODMAS from math) for its operators (e.g., ** before *, * before +)? Pro Tip: When in doubt, use parentheses () to dictate the exact sequence of calculations!<br>✨ <b>Try This Out:</b> <code>print(10 - 2 * 3, (10 - 2) * 3)</code>"
    },
    {
        title: "Assignment Superpowers!",
        text: "Did you know = in Python means 'assign a value'? And for an upgrade, operators like += or *= let you modify a variable's value in a flash (e.g., count += 1 is sleeker than count = count + 1).<br>✨ <b>Try This Out:</b> <code>points = 100; points -= 25; points</code>"
    },
    {
        title: "Logical Operator Smarts!",
        text: "Did you know Python's and and or operators are efficient? They use \"short-circuit evaluation.\" If the first condition of an and is False, Python skips the rest. Clever, huh?<br>✨ <b>Try This Out:</b> <code>has_key = False; knows_password = True; has_key and knows_password</code>"
    },
    {
        title: "is vs. == : The Real Deal!",
        text: "Did you know == checks if two values are equal (e.g., a = [1,2]; b = [1,2]; a == b is True), but is checks if they're the exact same object in memory (e.g., a is b would be False in the previous case, unless b = a). It's about true identity!<br>✨ <b>Try This Out:</b> <code>list_a = [10, 20]; list_b = [10, 20]; print(list_a == list_b, list_a is list_b)</code>"
    },
    {
        title: "The in Crowd Check!",
        text: "Did you know you can instantly see if an item is hiding in a list or if a character is part of a string? The in operator (e.g., 'apple' in fruits_list) quickly returns True or False. So handy for quick lookups!<br>✨ <b>Try This Out:</b> <code>print('py' in \"python_rocks\")</code>"
    },
    {
        title: "Arithmetic Aces: // and %!",
        text: "Beyond basic math, did you know Python has // (floor division) to give you the whole number part of a division, and % (modulus) to give you the remainder? These are total game-changers for many algorithms!<br>✨ <b>Try This Out:</b> <code>print(20 // 6, 20 % 6)</code>"
    },
    {
        title: "The 'Truthiness' of Data!",
        text: "Did you know that in Python, things like non-empty strings (\"hello\"), non-zero numbers (5, -1), and non-empty lists ([1, 2]) are considered True in boolean contexts (like an if statement)? Empty ones (\"\", 0, []) and None are False. Super useful for quick checks!<br>✨ <b>Try This Out:</b> <code>print(bool([1, \"item\"]), bool([]))</code>"
    },
    {
        title: "Strings are 'Immutable' Buddies!",
        text: "Did you know strings (str) in Python are 'immutable'? This means once you create a string, its content can't be changed directly. Any operation that seems to 'modify' a string actually creates a brand new one in memory!<br>✨ <b>Try This Out:</b> <code>my_string = \"code\"; my_string[0] = \"C\"</code> (Notice the error Python gives!)"
    },
    {
        title: "Merging Lists Like a Pro!",
        text: "Did you know you can easily combine two lists? Use the + operator (e.g., new_list = list1 + list2) to create a brand new merged list, or use the .extend() method (list1.extend(list2)) to add all items from list2 directly into list1.<br>✨ <b>Try This Out:</b> <code>first_half = [1,2]; second_half = [3,4]; first_half + second_half</code>"
    },
    {
        title: "Slicing with a 'Step'!",
        text: "Did you know Python's slicing for strings and lists can take a third 'step' argument? my_list[::2] will grab every other item, and the cool trick my_string[::-1] instantly reverses a string!<br>✨ <b>Try This Out:</b> <code>word = \"EXPLORER\"; word[::-2]</code>"
    },
    {
        title: "List Construction Magic with list()!",
        text: "Did you know you can quickly create a list from other iterable things like a string or a tuple using the list() constructor? For instance, list(\"hey\") magically transforms the string into ['h', 'e', 'y']!<br>✨ <b>Try This Out:</b> <code>list(\"PYTHON\")</code>"
    },
    {
        title: "Mastering List Removals!",
        text: "Did you know Python offers several ways to remove items from a list?<br><ul><li>.remove(value): Deletes the first occurrence of a specific value.</li><li>.pop(index): Removes AND returns the item at a given index (defaults to the last item).</li><li>del my_list[index]: Simply deletes the item at a specific index.</li></ul>Choose your weapon!<br>✨ <b>Try This Out:</b> <code>colors = [\"red\", \"green\", \"blue\"]; removed_color = colors.pop(1); print(colors, removed_color)</code>"
    },
    {
        title: "Chained Comparisons for Clarity!",
        text: "Did you know Python lets you chain comparison operators in a super readable way? You can write min_val < age < max_val to check if age falls within a range, just like you would in a math expression!<br>✨ <b>Try This Out:</b> <code>temp = 22; 15 < temp <= 25</code>"
    },
    {
        title: "Augmented Assignment for More Than Numbers!",
        text: "Did you know operators like += aren't just for math? You can use my_list += another_list to extend lists or my_string += \" extra\" to concatenate strings. It's a versatile shortcut!<br>✨ <b>Try This Out:</b> <code>message = \"Hello\"; message += \" Python!\"; message</code>"
    },
    {
        title: "Checking for None the Pythonic Way!",
        text: "Did you know when checking if a variable is None, the preferred Pythonic way is to use is None or is not None rather than == None? This is because None is a unique singleton object, making identity checks more direct.<br>✨ <b>Try This Out:</b> <code>result = None; result is None</code>"
    },
    {
        title: "The or Operator's Defaulting Trick!",
        text: "Did you know the or operator can be cleverly used to provide a default value? In an assignment like name = user_input or \"Guest\", if user_input is empty (or any 'falsy' value), name will become \"Guest\". Nifty!<br>✨ <b>Try This Out:</b> <code>user_setting = \"\" or \"default_theme\"; user_setting</code>"
    }
];
let nuggetIndex = 0;
function showNugget(idx) {
    const nugget = nuggets[idx];
    document.getElementById("nugget-content").innerHTML = `<h4>${nugget.title}</h4><div>${nugget.text}</div>`;
    document.getElementById("nugget-python-input").value = "";
    document.getElementById("nugget-python-output").textContent = "";
}
document.addEventListener("DOMContentLoaded", function() {
    showNugget(nuggetIndex);
    document.getElementById("nugget-prev").onclick = function() {
        nuggetIndex = (nuggetIndex - 1 + nuggets.length) % nuggets.length;
        showNugget(nuggetIndex);
    };
    document.getElementById("nugget-next").onclick = function() {
        nuggetIndex = (nuggetIndex + 1) % nuggets.length;
        showNugget(nuggetIndex);
    };
    setInterval(function() {
        nuggetIndex = (nuggetIndex + 1) % nuggets.length;
        showNugget(nuggetIndex);
    }, 15 * 60 * 1000); // 15 minutes
    // Python interpreter (Skulpt)
    document.getElementById("nugget-run-btn").onclick = function() {
        const code = document.getElementById("nugget-python-input").value;
        const output = document.getElementById("nugget-python-output");
        output.textContent = "Running...";
        if (window.Sk) {
            Sk.configure({
                output: function(text) { output.textContent += text; },
                read: function(x) { if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) throw "File not found: '" + x + "'"; return Sk.builtinFiles["files"][x]; }
            });
            Sk.misceval.asyncToPromise(function() {
                output.textContent = "";
                return Sk.importMainWithBody("<stdin>", false, code, true);
            }).catch(function(e) {
                output.textContent = e.toString();
            });
        } else {
            output.textContent = "Python interpreter not loaded.";
        }
    };
});