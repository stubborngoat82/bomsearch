import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


let supabaseUrl = 'https://tserqbkimfujuadsylxv.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZXJxYmtpbWZ1anVhZHN5bHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMxOTkzOTcsImV4cCI6MjAxODc3NTM5N30.P4VrTk6jcnDg_CY4673q5QPn6Z8VLQOnDngtC6KP7wU'; // Use your anon or public key here

const supabase = createClient( supabaseUrl, supabaseKey );

document.addEventListener('DOMContentLoaded', function() {

    loadVolumes();
    console.log("Initialization completed");

    const volumeDropdown = document.getElementById('volumeDropdown');
    volumeDropdown.addEventListener('change', loadBooks);
});

async function loadVolumes() {
    const { data, error } = await supabase.rpc('get_distinct_volumes')
    console.log(data);

    populateDropdown('volumeDropdown', data, 'volume_id', 'volume_title');
    document.getElementById('volumeDropdown').disabled = false;

}



async function fetchScripture() {
    const { data, error } = await supabase
        .from('scripture')
        .select('*'); // Fetches all columns

    if (error) console.log('Error:', error);
    else console.log('Data:', data);
}

async function addScriptureEntry(newEntry) {
    const { data, error } = await supabase
        .from('scripture')
        .insert([newEntry]);

    if (error) console.log('Error:', error);
    else console.log('Data:', data);
}

// Example usage
//addScriptureEntry({
 //   volume_id: 1,
//    book_id: 1,
    // ... other fields
 //   scripture_text: "Your scripture text here",
//});

async function updateScriptureEntry(id, updatedFields)
{
const { data, error } = await supabase
.from('scripture')
.update(updatedFields)
.match({ id });

if (error) console.log('Error:', error);
else console.log('Updated Data:', data);
}

// Example usage
// updateScriptureEntry(1, { scripture_text: "Updated scripture text" });




async function deleteScriptureEntry(id) {
    const { data, error } = await supabase
        .from('scripture')
        .delete()
        .match({ id });

    if (error) console.log('Error:', error);
    else console.log('Deleted Data:', data);
}

// Example usage
//deleteScriptureEntry(1);

async function loadBooks() {
    console.log('loadBooks function called');
    const volumeDropdown = document.getElementById('volumeDropdown');
    const selectedOption = volumeDropdown.options[volumeDropdown.selectedIndex];
    
    // Extract the volume_id from the selected option
    const volume_id_param = selectedOption.value;

    if (!volume_id_param) return;

    const { data, error } = await supabase.rpc('get_distinct_books_in_volume', { volume_id_param });
    console.log(data);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if(data && data.length > 0) {
        populateDropdown('bookDropdown', data, 'book_id', 'book_title');
        document.getElementById('bookDropdown').disabled = false;
    } else {
        console.log('No books found for the selected volume');
    }

    const bookDropdown = document.getElementById('bookDropdown');
    bookDropdown.addEventListener('change', loadChapters);
}



async function loadChapters() {
    console.log('loadChapters function called');
    const bookDropdown = document.getElementById('bookDropdown');
    const selectedOption = bookDropdown.options[bookDropdown.selectedIndex];
    
    // Extract the volume_id from the selected option
    const book_id_param = selectedOption.value;

    if (!book_id_param) return;

    const { data, error } = await supabase.rpc('get_distinct_chapters_in_book_with_order', { book_id_param });
    console.log(data);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if(data && data.length > 0) {
        populateDropdown('chapterDropdown', data, 'chapter_id', 'chapter_number');
        document.getElementById('chapterDropdown').disabled = false;
    } else {
        console.log('No chapters found for the selected volume');
    }

    const chapterDropdown = document.getElementById('chapterDropdown');
    chapterDropdown.addEventListener('change', loadVerses);

}


async function loadVerses() {
    console.log('loadVerses function called');
    const chapterDropdown = document.getElementById('chapterDropdown');
    const selectedOption = chapterDropdown.options[chapterDropdown.selectedIndex];

    // Extract the chapter id from the selected option
    const chapter_id_param = parseInt(selectedOption.value);

    if (!chapter_id_param) return;

    const { data, error } = await supabase.rpc('get_distinct_verses_in_chapter_with_order', { chapter_id_param });
    console.log(data);

    if (error) {
        console.error('Error:', error);
        return;
    }

    // Populate start and end verse dropdowns with verse numbers
    populateDropdown('verseStartDropdown', data, 'verse_number', 'verse_number');
    document.getElementById('verseStartDropdown').disabled = false;
    populateDropdown('verseEndDropdown', data, 'verse_number', 'verse_number');
    document.getElementById('verseEndDropdown').disabled = false;
    
    const verseEndDropdown = document.getElementById('verseEndDropdown');
    verseEndDropdown.addEventListener('change',() => getSelectedVerses(chapter_id_param));
}
  

async function getSelectedVerses(chapterId) {
    console.log('getSelectedVerses function called');
    const verseStartDropdown = document.getElementById('verseStartDropdown');
    const verseEndDropdown = document.getElementById('verseEndDropdown');
    const startSelectedOption = verseStartDropdown.options[verseStartDropdown.selectedIndex];
    const endSelectedOption = verseEndDropdown.options[verseEndDropdown.selectedIndex];
    console.log(startSelectedOption);
    console.log(endSelectedOption)

    const start_verse_param = startSelectedOption.value;
    const end_verse_param = endSelectedOption.value;
    const chapter_id_param = chapterId;
    console.log(chapter_id_param, start_verse_param, end_verse_param);

    if (isNaN(start_verse_param) || isNaN(end_verse_param)) {
        // Invalid selection, display error or default message
        document.getElementById('scriptureText').innerHTML = '<p>Please select a starting and ending verse.</p>';
        return; // Return early if there's an error
    }

    if (start_verse_param > end_verse_param) {
        // Invalid range, display error or default message
        document.getElementById('scriptureText').innerHTML = '<p>End verse must be greater than or equal to start verse.</p>';
        return; // Return early if there's an error
    }

    const { data, error } = await supabase.rpc('get_verses_in_range', { chapter_id_param, start_verse_param, end_verse_param });
    console.log(data);

    if (error) {
        console.error('Error:', error);
        return;
    }

    displaySelectedVerses(data);
}

async function displaySelectedVerses(versesData) {
    console.log('displaySelectedVerses function called');
    const scriptureTextDiv = document.getElementById('scriptureText');

    // Create a list for the scripture verses
    let scriptureVersesHTML = '<ul class="scriptureVerses">';
    versesData.forEach(verse => {
        const verseText = verse.scripture_text;
        const verseDetail = verse.verse_title;
        scriptureVersesHTML += `
            <li class="scriptureVerse">
                <p><strong>${verseDetail}</strong></p>
                <p>${verseText}</p>
                <button class="copyButton" onclick="copyVerse('${verseText}')">
                    Copy
                </button>
            </li>
        `;
    });
    scriptureVersesHTML += '</ul>';

    // Display the scripture verses in the scriptureTextDiv
    if (scriptureVersesHTML) {
        scriptureTextDiv.innerHTML = scriptureVersesHTML;
    } else {
        scriptureTextDiv.innerHTML = '<p>No scripture found for the selected range of verses.</p>';
    }
}


function populateDropdown(dropdownId, data, valueField, textField) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = `<option value="">Select ${dropdownId.replace('Dropdown', '')}</option>`;
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        dropdown.appendChild(option);
    });
}

//async function loadVolumes() {
 //  const { data, error } = await supabase
  //      .from('scripture')
 //       .select('volume_id, volume_title')
//        .distinct('volume_id, volume_title')
//  populateDropdown('volumeDropdown', data, 'volume_id', 'volume_title');
 //   document.getElementById('volumeDropdown').disabled = false;
//
//}

async function displayScripture() {
    console.log('displayScripture function called');
    const verseDropdown = document.getElementById('verseDropdown');
    const selectedOption = verseDropdown.options[verseDropdown.selectedIndex];
    
    // Extract the volume_id from the selected option
    const verse_id_param = selectedOption.value;

    if (!verse_id_param) return;

    const { data, error } = await supabase.rpc('get_scripture_text_for_verse', { verse_id_param });
    console.log(data);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data) {
        const scriptureText = data[0].scripture_text;
        const scriptureTextDiv = document.getElementById('scriptureText');
        scriptureTextDiv.innerHTML = scriptureText;
    } else {
        console.log('No verses found for the selected volume');
    }

}

function copyVerse(text) {
    // Create a textarea element to hold the text to be copied
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', ''); // Make textarea readonly to avoid focus and move outside of view
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px'; // Move the textarea off-screen
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy'); // Copy the selected text
    document.body.removeChild(textarea); // Remove the textarea
    alert('Verse copied to clipboard: ' + text); // Optionally notify the user
}