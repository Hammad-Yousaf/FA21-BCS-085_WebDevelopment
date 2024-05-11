$(document).ready(function() {
    // Function to fetch data from the API and render stories
    function fetchDataAndRender() {
        $.getJSON('https://usmanlive.com/wp-json/api/stories', function(data) {
            renderStories(data);
        }).fail(function(jqxhr, textStatus, error) {
            console.error('Error fetching data:', textStatus, error);
        });
    }
    
    // Function to render stories
    function renderStories(data) {
        $('.storyContainer').empty();
        $.each(data, function(index, story) {
            const storyElement = `
                <div class="story" data-id="${story.id}">
                    <h2>${story.title}</h2>
                    <p>${story.content}</p>
                    <div class="story-buttons">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                </div>
            `;
            $('.storyContainer').append(storyElement);
        });

        // Attach event listener to delete buttons
        $('.delete-btn').click(function() {
            const storyId = $(this).closest('.story').data('id');
            deleteStory(storyId);
        });

        // Attach event listener to edit buttons
        $('.edit-btn').click(function() {
            const storyDiv = $(this).parent().parent();
            const storyId = storyDiv.data('id');
            const title = storyDiv.find('h2').text();
            const content = storyDiv.find('p').text();
            const newTitle = prompt('Enter new title:', title);
            const newContent = prompt('Enter new content:', content);
            if (newTitle !== null && newContent !== null) {
                updateStory(storyId, newTitle, newContent);
            }
        });
    }

    // Function to delete a story
    function deleteStory(storyId) {
        $.ajax({
            url: `https://usmanlive.com/wp-json/api/stories/${storyId}`,
            type: 'DELETE',
            success: function(result) {
                console.log('Story deleted successfully');
                fetchDataAndRender(); // Re-render stories after deletion
            },
            error: function(jqxhr, textStatus, error) {
                console.error('Error deleting story:', textStatus, error);
            }
        });
    }

    // Function to update a story
    function updateStory(storyId, newTitle, newContent) {
        const updatedStory = {
            title: newTitle,
            content: newContent
        };
        $.ajax({
            url: `https://usmanlive.com/wp-json/api/stories/${storyId}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedStory),
            success: function(result) {
                console.log('Story updated successfully');
                fetchDataAndRender(); // Re-render stories after update
            },
            error: function(jqxhr, textStatus, error) {
                console.error('Error updating story:', textStatus, error);
            }
        });
    }

    // Function to create a new story
    $('#create-btn').click(function() {
        const newTitle = $('#new-title').val();
        const newContent = $('#new-content').val();
        if (newTitle && newContent) {
            const newStory = {
                title: newTitle,
                content: newContent
            };
            $.ajax({
                url: 'https://usmanlive.com/wp-json/api/stories',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newStory),
                success: function(result) {
                    console.log('Story created successfully');
                    fetchDataAndRender(); // Re-render stories after creation
                    $('#new-title').val('');
                    $('#new-content').val('');
                },
                error: function(jqxhr, textStatus, error) {
                    console.error('Error creating story:', textStatus, error);
                }
            });
        } else {
            alert('Please enter both title and content.');
        }
    });

    // Initial fetch and render
    fetchDataAndRender();
});

