import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { IncomeStream, IncomeStreamData } from "@/components/income/IncomeStream";
import { IncomeStreamForm } from "@/components/forms/IncomeStreamForm";

interface IncomeTabProps {
  streams: IncomeStreamData[];
  onAddStream: (stream: Omit<IncomeStreamData, "id">) => void;
  onEditStream: (stream: IncomeStreamData) => void;
  onDeleteStream: (id: string) => void;
}

export const IncomeTab = ({ streams, onAddStream, onEditStream, onDeleteStream }: IncomeTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState<IncomeStreamData | null>(null);

  const handleSubmit = (streamData: Omit<IncomeStreamData, "id"> & { id?: string }) => {
    if (streamData.id) {
      // Editing existing stream
      onEditStream(streamData as IncomeStreamData);
    } else {
      // Adding new stream
      onAddStream(streamData);
    }
    setShowForm(false);
    setEditingStream(null);
  };

  const handleEdit = (stream: IncomeStreamData) => {
    setEditingStream(stream);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStream(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Income Streams</h1>
            <p className="text-muted-foreground">Manage your recurring income sources</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-soft"
            >
              <Plus size={20} className="mr-2" />
              Add Stream
            </Button>
          )}
        </div>

        {showForm && (
          <div className="mb-6">
            <IncomeStreamForm
              stream={editingStream || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}

        {streams.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Income Streams Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first income stream to start tracking your finances
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {streams.map((stream) => (
              <IncomeStream
                key={stream.id}
                stream={stream}
                onEdit={handleEdit}
                onDelete={onDeleteStream}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};