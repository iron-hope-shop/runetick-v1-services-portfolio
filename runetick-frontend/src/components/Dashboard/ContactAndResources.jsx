import React from 'react';
import { Box, Typography, Grid, IconButton, List, ListItem, Link } from '@mui/material';
import { mockContactAndResources } from './mockData';

const ContactAndResources = () => {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Contact & Resources</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>Social Media</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {mockContactAndResources.socialMedia.map((item, index) => (
                            <IconButton
                                key={index}
                                component="a"
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: 'white', '&:hover': { color: 'primary.main' } }}
                            >
                                <item.icon />
                            </IconButton>
                        ))}
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>Contact</Typography>
                    <List dense sx={{ p: 0 }}>
              <ListItem key={"email"} disablePadding sx={{ mb: 0.5 }}>
                <Link
                  href={"mailto:seer@runetick.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'white', // Change text color to lime
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none', // Remove text decoration
                  }}
                >
                  <Typography variant="caption" style={{ color: 'inherit' }}>seer@runetick.com</Typography>
                </Link>
              </ListItem>
              <ListItem key={"disc"} disablePadding sx={{ mb: 0.5 }}>
                <Link
                  href={"https://discord.gg/cActgyWvrA"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'lime', // Change text color to lime
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none', // Remove text decoration
                  }}
                >

                  <Typography variant="caption" style={{ color: 'inherit' }}>Runetick Discord</Typography>
                </Link>
              </ListItem>
            </List>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="caption" sx={{ color: 'white', mb: 1 }}>
                    A special thanks to the OSRS Wiki Discord community for guidance throughout this project.
                        All price data is retrieved from the OSRS Wiki via the <Link
                            href={"https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices"}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'lime', // Change text color to lime
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none', // Remove text decoration
                            }}
                        >

                            <Typography variant="caption" style={{ color: 'inherit' }}>RuneScape: Real-time Prices API</Typography>
                        </Link>
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ContactAndResources;