import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

async function fetchData(page = 1, colors = [], limit = 10, offset = 0) {

    const url = new URI(window.path)
    url.addQuery({page, limit, offset, 'color[]': colors})
  
    const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`Error fetching data. Status code: ${response.status}`);
        throw new Error('Failed to fetch data =/');
      } 
    
  
      return response.json();
     
}

// Helper function to check if an item has a primary color
function hasPrimaryColor(item) {
    const primaryColors = ['red', 'blue', 'yellow'];
    return primaryColors.includes(item.color);
  }

function retrieve(options = {}) {
    const { page = 1, colors = [] } = options;
    const limit = 10;
    const offset = (page - 1) * limit;

    return fetchData(page, colors, limit, offset)
      .then(data => {

        const newData = {
          ids: data.map(item => item.id),
          open: data.filter(item => item.disposition === 'open').map(item => ({ ...item, isPrimary: hasPrimaryColor(item) })),
          closedPrimaryCount: data.filter(item => item.disposition === 'closed' && hasPrimaryColor(item)).length,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: data.length === limit && data.length > 0 ? page + 1 : null,
        };

        //  condition for nextPage when data is empty or last page
        if (data.length < limit || (data.length === limit && page === 50)) {
            newData.nextPage = null;
          }
      
        return newData;
      })
      .catch(error => {
        console.error(error.message);

        return { error: true, message: error.message };
      });
}

export default retrieve;
