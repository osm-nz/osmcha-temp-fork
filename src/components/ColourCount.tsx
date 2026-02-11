import classes from './ColourCount.module.css';

export const ColourCount: React.FC<{
  remove: number;
  modify: number;
  add: number;
}> = ({ remove, modify, add }) => {
  return (
    <div className={classes.ColourCount}>
      <span>{add}</span>
      <span>{modify}</span>
      <span>{remove}</span>
    </div>
  );
};
