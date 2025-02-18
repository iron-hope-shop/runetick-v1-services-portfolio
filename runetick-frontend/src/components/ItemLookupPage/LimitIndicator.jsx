import { Chip, Tooltip } from "@mui/material";

export const LimitIndicator = ({ lim }) => {
  return (
    <Tooltip
      title={
        lim
          ? ""
          : "If you know the limit for this item, consider adding it to https://oldschool.runescape.wiki/"
      }
    >
      <Chip
        label={`LIMIT: ${lim || '??'}`}
        size="small"
        sx={{
          mt: 1,
          mr: 1,
          width: 96,
          bgcolor: 'transparent',
          color: 'grey', // Text color
          border: '1px solid grey',
          '& .MuiChip-icon': {
            color: 'grey', // Adjust icon color if needed
          },
        }}
      />
    </Tooltip>
  );
};