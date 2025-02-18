import React, { useState } from 'react';
import { Box, Container, Grid, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import MarketIndices from './MarketIndices';
import RecordYourTrade from './RecordYourTrade';
import OSRSCompleteGE from './OSRSCompleteGE';
import OSRSNews from './OSRSNews';
import ContactAndResources from './ContactAndResources';
import { useIndices } from '../Hooks/useIndices';
import { useUserSettings } from '../Hooks/useUserSettings';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import { useVolumes } from '../Hooks/useVolumes';
import { useAuth } from '../AuthProvider/AuthProvider';
import { useNavigate } from 'react-router-dom';
// import YourPositions from './YourPositions';
import { useUserLogs } from '../Hooks/useUserLogs';
import { useRealtimePrices } from '../Hooks/useRealtimePrices';
// import { useLongTermChanges } from '../Hooks/useLongTermChanges';

const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '4px',
    backgroundColor: 'transparent',
};

const EnhancedDashboard = ({ itemMapping, onItemSelect }) => {
    const [marketIndicesExpanded, setMarketIndicesExpanded] = useState(true);
    const { data: dummyToTriggerHistoryUpdates, isLoading: isUserSettingsLoading, error: userSettingsError } = useUserSettings();
    const { data: volumeData, isLoading: isVolumesLoading, error: volumesError } = useVolumes();
    const { data: logs, isLoading: logsLoading, error: logsError } = useUserLogs();
    const { data: realtimePrices, isLoading: realtimePricesLoading, error: realtimePricesError } = useRealtimePrices();
    const { data: indicesData, isLoading: isIndicesDataLoading, error: indicesDataError } = useIndices();
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) {
        navigate("/");
        return null;
    }

    const isLoading = isUserSettingsLoading || isVolumesLoading || logsLoading || realtimePricesLoading || isIndicesDataLoading;
    const error = userSettingsError || volumesError || logsError || realtimePricesError || indicesDataError;

    if (isLoading || error) return <LoadingScreen spinway={true} />;

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#121212' }}>
            <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} >
                                <MarketIndices
                                    isExpanded={marketIndicesExpanded}
                                    onToggle={() => setMarketIndicesExpanded(!marketIndicesExpanded)}
                                    indicesData={indicesData}
                                    isLoading={isIndicesDataLoading}
                                    error={indicesDataError}
                                    onItemSelect={onItemSelect}
                                />
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Box sx={{...cardStyle, backgroundColor: "rgb(255, 255, 255, .05)"}}>
                                <OSRSCompleteGE onItemSelect={onItemSelect} />
                            </Box>
                        </Grid>
                        {/* <Grid item xs={12} md={12}>
                                <YourPositions onItemSelect={onItemSelect} />
                        </Grid> */}
                        
                        <Grid item xs={12} md={12} >
                                <RecordYourTrade itemMapping={itemMapping} onItemSelect={onItemSelect} />
                        </Grid>
                            
                        <Grid item xs={12} md={12}>
                            <Box sx={{...cardStyle, backgroundColor: "rgb(255, 255, 255, .05)"}}>
                                <OSRSNews />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Box sx={cardStyle}>
                                <ContactAndResources />
                            </Box>
                        </Grid>
                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
};

export default EnhancedDashboard;