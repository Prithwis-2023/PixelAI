import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { TrainingMetrics } from '../types';
import { S as AppStyles } from '../styles/App.styles';

interface TrainingVisualizerProps {
  metrics: TrainingMetrics | null;
}

export default function TrainingVisualizer({ metrics }: TrainingVisualizerProps) {
  if (!metrics || metrics.epochs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)', fontFamily: AppStyles.appFont.fontFamily }}>
        NO TRAINING DATA AVAILABLE
      </div>
    );
  }

  // Transform metrics data into a Recharts-friendly array
  const data = metrics.epochs.map((epoch, i) => ({
    name: `Epoch ${epoch}`,
    trainLoss: metrics.train_loss[i],
    valLoss: metrics.val_loss[i],
    trainIou: metrics.train_iou ? metrics.train_iou[i] : 0,
    valIou: metrics.val_iou ? metrics.val_iou[i] : 0,
    time: metrics.time_per_epoch[i],
  }));

  const containerStyle = {
    padding: '24px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(45, 235, 169, 0.3)',
    borderRadius: '4px',
    marginTop: '20px',
  };

  const titleStyle = {
    fontSize: '14px',
    fontWeight: 700,
    color: '#2DEBA9',
    letterSpacing: '0.04em',
    fontFamily: AppStyles.appFont.fontFamily,
    marginBottom: '16px',
    textAlign: 'center' as const,
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>CNN TRAINING METRICS</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ width: '100%', height: 300 }}>
          <h4 style={{...titleStyle, fontSize: '12px', color: 'rgba(255,255,255,0.7)', textAlign: 'left', marginBottom: '8px'}}>LOSS CURVE (LOWER IS BETTER)</h4>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #2DEBA9', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="trainLoss" name="Training Loss" stroke="#FF64C8" strokeWidth={2} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="valLoss" name="Validation Loss" stroke="#2DEBA9" strokeWidth={2} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {metrics.val_iou && metrics.val_iou.length > 0 && (
          <div style={{ width: '100%', height: 300 }}>
            <h4 style={{...titleStyle, fontSize: '12px', color: 'rgba(255,255,255,0.7)', textAlign: 'left', marginBottom: '8px'}}>ACCURACY (IoU - HIGHER IS BETTER)</h4>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #2DEBA9', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="trainIou" name="Training IoU" stroke="#FFE900" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="valIou" name="Validation IoU" stroke="#00E5FF" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
