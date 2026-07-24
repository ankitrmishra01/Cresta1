"""
Attention-LSTM Model Architecture for Stock Price Prediction.

Contains the Self-Attention mechanism and the hybrid AttentionLSTM
model that learns which timesteps in the lookback window are most
important for forecasting.
"""
import torch
import torch.nn as nn


class SelfAttention(nn.Module):
    """
    Self-attention layer that learns which timesteps in the
    lookback window are most important for the forecast.
    """
    def __init__(self, hidden_size):
        super(SelfAttention, self).__init__()
        self.attention = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.Tanh(),
            nn.Linear(hidden_size // 2, 1)
        )

    def forward(self, lstm_output):
        # lstm_output shape: (batch, seq_len, hidden_size)
        attention_weights = self.attention(lstm_output)       # (batch, seq_len, 1)
        attention_weights = torch.softmax(attention_weights, dim=1)
        # Weighted sum of LSTM outputs
        context = torch.sum(lstm_output * attention_weights, dim=1)  # (batch, hidden_size)
        return context, attention_weights


class AttentionLSTM(nn.Module):
    """
    LSTM with Self-Attention for stock price prediction.
    The attention mechanism lets the model focus on the most
    important days in the lookback window (earnings, crashes, etc).
    """
    def __init__(self, input_size, hidden_size=64, num_layers=2, output_size=7):
        super(AttentionLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.input_size = input_size
        self.output_size = output_size

        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers,
            batch_first=True, dropout=0.2
        )
        self.attention = SelfAttention(hidden_size)
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 32),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(32, output_size)
        )

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        lstm_out, _ = self.lstm(x, (h0, c0))

        # Apply attention over all timesteps
        context, _ = self.attention(lstm_out)

        out = self.fc(context)
        return out


# Keep backward compatibility alias
StockLSTM = AttentionLSTM
