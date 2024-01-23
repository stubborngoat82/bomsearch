import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


let supabaseUrl = 'https://tserqbkimfujuadsylxv.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZXJxYmtpbWZ1anVhZHN5bHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMxOTkzOTcsImV4cCI6MjAxODc3NTM5N30.P4VrTk6jcnDg_CY4673q5QPn6Z8VLQOnDngtC6KP7wU'; // Use your anon or public key here

const supabase = createClient( supabaseUrl, supabaseKey );

document.addEventListener('DOMContentLoaded', function() {

    loadVolumes();
    console.log("Initialization completed");

    const volumeDropdown = document.getElementById('volumeDropdown');
    volumeDropdown.addEventListener('change', generateRandomVerse );
});

async function loadVolumes() {
    const { data, error } = await supabase.rpc('get_distinct_volumes');
    if (error) {

    }
    console.log(data);

    populateDropdown('volumeDropdown', data, 'volume_id', 'volume_title');
    document.getElementById('volumeDropdown').disabled = false;

}

async function generateRandomVerse() {
    console.log('getRandomVerse function called');
    const volumeDropdown = document.getElementById('volumeDropdown');
    const selectedOption = volumeDropdown.options[volumeDropdown.selectedIndex];

    const volume_id_param = selectedOption.value;
    if (!volume_id_param) return;

    const { data, error } = await supabase.rpc('get_random_scripture', {volume_id_param});
    console.log(data);

    if (error) {
        console.error('Error:', error);
        return;
    }
    displayScripture(data);

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

async function displayScripture(data) {
    console.log('displayScripture function called');
    const scriptureTextDiv = document.getElementById('scriptureText');

    if (data && data.length > 0) {
        const verseText = data[0].scripture_text;
        const verseDetail = data[0].verse_title;

        scriptureTextContainer.innerHTML = `
            <p><strong>${verseDetail}</strong></p>
            <p>${verseText}</p>
        `;
    } else {
        scriptureTextDiv.innerHTML = '<p>No scripture found for the selected volume.</p>';
    }
}

function generateNew() {
    generateRandomVerse();
}

function copyVerse() {
    const randomVerse = document.getElementById('randomVerse').textContent;
    navigator.clipboard.writeText(randomVerse);
    alert('Verse copied to clipboard.');
}
