import { AppBar, Toolbar,Button ,Box} from '@mui/material';
import React, { useState } from 'react';
import AddReactionIcon from '@mui/icons-material/AddReaction';

function StickyNavbar() {
    const navdata=['High','Medium','Low'];

    // Function to set icon color based on item
  const getIconColor = (item) => {
    switch (item.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FFC107';
      case 'low': return '#2196F3'; // Change to any color you prefer
      default: return 'black';
    }
  };

  return (
    <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', position: 'fixed', bottom: 0}}>
        <AppBar sx={{backgroundColor:"white",
                    top:'auto',
                    bottom:0,
                    height:'60px',
                    // boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
                    transition:'none',
                    animation:'none',
                    transform:'none',
                    width: 'fit-content', // Dynamic width based on content
                    borderRadius: 3, // Rounded edges
                    }} 
                    position='fixed'>
        <Toolbar sx={{
            display: 'flex',
            backgroundColor:'white',
            alignItems:'center',
            justifyContent: {xs:'start',sm:'start',md:'center'},
            gap: '10px', // Space between buttons
            overflowX:'auto', // Enable horizontal scrolling
            padding: '10px 16px', // Add padding for better touch accessibility
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          }}>
        {navdata.map((item)=>(
                    <Button key={item}
                        variant='contained' 
                        sx={{
                            backgroundColor:'white',
                            borderStyle:'solid',
                            borderColor:'white',
                            borderWidth:'2px',
                        color:'black',
                        fontWeight:'bold',
                        maxWidth:'none',
                        width:'fit-content',
                        transition: 'none',
                        animation: 'none',
                        borderRadius: '5px',
                        fontSize:{xs:'9px',sm:'12px',md:'15px'},
                        '&:hover': {
                          backgroundColor: 'white',
                          color:'#3A486E'
                        },
                      }} >{item}
                      <AddReactionIcon sx={{color:getIconColor(item),marginLeft:1}}/>
                      </Button>  
            ))}
            <Box sx={{minWidth:'16px'}}/>
            </Toolbar>
    </AppBar>
    </Box>
    
  )
}

export default StickyNavbar