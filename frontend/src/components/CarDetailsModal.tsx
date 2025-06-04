import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CarDetails {
  id: number;
  brand: string;
  model: string;
  year: number;
  power?: number;
  transmission: string;
  condition: string;
  mileage: number;
  features?: string[];
  price: number;
  seller?: {
    name: string;
    contact_info?: string;
  };
  store?: {
    name: string;
    address?: string;
  };
}

interface CarDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: CarDetails | null;
  loading: boolean;
}

export default function CarDetailsModal({ open, onOpenChange, car, loading }: CarDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Загрузка</DialogTitle>
            </DialogHeader>
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
            </div>
          </>
        ) : car ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {car.brand} {car.model}, {car.year}
              </DialogTitle>
              <DialogDescription>
                <span className="text-xl font-bold">{car.price.toLocaleString()} ₽</span>
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-500">Фото отсутствует</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Характеристики</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Год выпуска</p>
                    <p className="font-medium">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Пробег</p>
                    <p className="font-medium">{car.mileage.toLocaleString()} км</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">КПП</p>
                    <p className="font-medium">{car.transmission}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Состояние</p>
                    <p className="font-medium">{car.condition === "new" ? "Новый" : "С пробегом"}</p>
                  </div>
                  {car.power && (
                    <div>
                      <p className="text-sm text-gray-500">Мощность</p>
                      <p className="font-medium">{car.power} л.с.</p>
                    </div>
                  )}
                </div>

                {car.features && car.features.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Особенности</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {car.features.map((feature, index) => (
                        <li key={index} className="text-sm">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {car.seller && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Продавец</h3>
                    <p className="text-sm">
                      {car.seller.name}
                      {car.seller.contact_info ? `, ${car.seller.contact_info}` : ""}
                    </p>
                  </div>
                )}

                {car.store && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Магазин</h3>
                    <p className="text-sm">
                      {car.store.name}
                      {car.store.address ? `, ${car.store.address}` : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Ошибка</DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center text-gray-500">Не удалось загрузить информацию об автомобиле</div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
