import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const loadingMessages = [
  "Finding Bob...",
  "Solving master clue scroll...",
  "Staking 100k at duel arena...",
  "Chopping yews...",
  "Feeding kitten...",
  "Attempting to buy gf...",
  "Panic selling lobsters...",
  "Fishing for upvotes...",
  "Alching rune pl8...",
  "Equipping party hat...",
  "Teleporting to Varrock...",
  "Slaying gargoyles...",
  "Cooking karambwans...",
  "Being nice to noobs...",
  "Pickpocketing elves...",
  "Burying bones...",
  "Smithing rune platebodies...",
  "Dancing for money pl0x...",
  "Fletching dragon arrows...",
  "Mining essence...",
  "Killing cows...",
  "Invading a goblin village...",
  "Roleplaying in the Ardougne...",
  "Examining everything...",
  "Picking potatoes...",
  "Casting fire strike...",
  "Hunting implings...",
  "Picking up coins...",
  "Casting vengeance...",
  "Dropping trout...",
  "Stacking...",
  "Asking for free stuff...",
  "Bank sale! Everything must go...",
  "Blackjacking npcs...",
  "Busting bots...",
  "Turning bones into fruit...",
  "Navigating to the Grand Exchange...",
  "Identifying herbs...",
  "Sending trade request...",
  "Crafting nats...",
  "Summoning thrall...",
  "Woodcutting and chill...",
  "800M DROP PARTY...",
  "Picking flax...",
  "Hunting chinchompas...",
  "Praying to RNGesus...",
  "Scattering ashes...",
  "Reported...",
  "GG...",
  "Cutting magic logs...",
  "Attempting Jad...",
  "Failing Jad...",
  "Burning shrimp...",
  "Training agility... this may take a while...",
  "Rushing chaos altar...",
  "Pking in the wildy...",
  "Losing bank at sand casino...",
  "Farming ranarrs...",
  "Checking GE offers...",
  "Completing Monkey Madness...",
  "Trying to remember bank PIN...",
  "Killing rock crabs...",
  "Doing one small favour...",
  "LARPing in lumbridge...",
  "Killing men for gp...",
  "Attempting Dragon Slayer...",
  "Dying to Elvarg...",
  "Questing for barrows gloves...",
  "Runecrafting (send help)...",
  "Cooking sharks...",
  "Failing agility course...",
  "Killing Zulrah...",
  "Dying to Jad...",
  "Collecting blue dragon scales...",
  "Pickpocketing HAM members...",
  "Doing Barrows runs...",
  "Doing slayer task...",
  "Killing Vorkath...",
  "Completing Monkey Madness...",
  "Failing to get pet drop...",
  "Complaining about drop rates...",
  "Picking up ashes at GE...",
  "Leveling up Runecrafting...",
  "Wish me luck...",
  "Dying at Wintertodt...",
  "Doing farm runs...",
  "Fishing monkfish...",
  "Killing Kalphite Queen...",
  "Attempting ToB...",
  "Doing bird house runs...",
  "Killing Abyssal Sire...",
  "Dying to PKers...",
  "Doing Pyramid Plunder...",
  "Failing to get Ranger boots...",
  "Doing Tears of Guthix...",
  "Doing Nightmare Zone...",
  "Killing Cerberus...",
  "Slaying lizardmen...",
  "Doing Mahogany Homes...",
  "Killing Grotesque Guardians...",
  "Attempting Galvek...",
  "D/C...",
  "Loading more loading messages...",
];

const LoadingScreen = ({ spinway }) => {
  const [message, setMessage] = useState('');
  const [color, setColor] = useState('white');
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const changeMessage = () => {
      const newMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      setMessage(newMessage);
      
      // Randomly change color
      const colors = ['red', 'white', 'lime'];
      setColor(colors[Math.floor(Math.random() * colors.length)]);
      
      // Randomly change direction
      setDirection(Math.random() < 0.5 ? -1 : 1);
    };

    // Set initial message, color, and direction
    changeMessage();

    const interval = setInterval(changeMessage, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#121212',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <CircularProgress 
        size={60} 
        thickness={4} 
        sx={{ 
          color: color,
          animation: `MuiCircularProgress-keyframes-circular-rotate 1s linear infinite ${ spinway ? "reverse" : direction === 1 ? 'normal' : 'reverse' }`,
        }} 
      />
      <Typography variant="body1" color="text.secondary" sx={{ marginTop: 2, color: 'white' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;