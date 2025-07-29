import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  icon?: ReactNode;
}

export interface GlassBarChartProps {
  data: ChartDataPoint[];
  title?: string;
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  className?: string;
}

export interface GlassPieChartProps {
  data: ChartDataPoint[];
  title?: string;
  size?: number;
  centerText?: string;
  className?: string;
}

export interface GlassProgressRingProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: ReactNode;
  className?: string;
}

// Bar Chart Component
export const GlassBarChart = ({
  data,
  title,
  maxValue,
  height = 200,
  showValues = true,
  className
}: GlassBarChartProps) => {
  const maxVal = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className={clsx('glass-card p-6', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <div className="relative" style={{ height }}>
        <div className="flex items-end justify-between gap-2 h-full">
          {data.map((item, index) => {
            const barHeight = (item.value / maxVal) * (height - 40);
            const barColor = item.color || 'bg-blue-500/80';
            
            return (
              <div key={item.label} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: barHeight }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={clsx(
                      'w-full rounded-t-lg relative overflow-hidden backdrop-blur-sm',
                      barColor
                    )}
                    style={{ minHeight: barHeight }}
                  >
                    {/* Glass reflection effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
                    
                    {showValues && item.value > 0 && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                        <span className="text-xs font-bold text-white">
                          {item.value}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
                
                <div className="mt-2 text-center">
                  {item.icon && (
                    <div className="mb-1 flex justify-center">
                      {item.icon}
                    </div>
                  )}
                  <span className="text-xs text-white/80 block">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Pie Chart Component  
export const GlassPieChart = ({
  data,
  title,
  size = 160,
  centerText,
  className
}: GlassPieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativeAngle = 0;
  
  const radius = size / 2 - 10;
  const center = size / 2;
  
  return (
    <div className={clsx('glass-card p-6 text-center', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <div className="relative inline-block">
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;
            
            cumulativeAngle += angle;
            
            if (item.value === 0) return null;
            
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const x1 = center + radius * Math.cos(startAngleRad);
            const y1 = center + radius * Math.sin(startAngleRad);
            const x2 = center + radius * Math.cos(endAngleRad);
            const y2 = center + radius * Math.sin(endAngleRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${center} ${center}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            return (
              <motion.path
                key={item.label}
                d={pathData}
                fill={item.color || `hsl(${(index * 360) / data.length}, 70%, 60%)`}
                className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            );
          })}
        </svg>
        
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {centerText}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color || `hsl(${(index * 360) / data.length}, 70%, 60%)`
                }}
              />
              <span className="text-white/80">{item.label}</span>
            </div>
            <span className="text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Ring Component
export const GlassProgressRing = ({
  value,
  maxValue,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  children,
  className
}: GlassProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / maxValue) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="drop-shadow-sm"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {percentage.toFixed(0)}%
            </div>
            <div className="text-xs text-white/60">
              {value}/{maxValue}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  BarChart: GlassBarChart,
  PieChart: GlassPieChart,
  ProgressRing: GlassProgressRing
};