"use client"

import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StockFormExtendedFields } from './StockFormExtendedFields'
import { StockSchema } from '@/core/types/portfolio'

// Schema para o formulário
const formSchema = StockSchema.extend({
  ticker: z.string().min(1, "Ticker é obrigatório").max(10, "Ticker deve ter no máximo 10 caracteres"),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  targetPercentage: z.coerce.number().min(0, "Percentual deve ser maior ou igual a zero").max(100, "Percentual deve ser menor ou igual a 100"),
  userRecommendation: z.enum(['Comprar', 'Aguardar', 'Vender']).optional(),
  // Novos campos são opcionais no formulário
  precoTetoUsuario: z.number().positive("Preço teto deve ser maior que zero").optional(),
  precoMedioCompra: z.number().positive("Preço médio deve ser maior que zero").optional(),
  notasFundamentos: z.string().max(500, "Notas devem ter no máximo 500 caracteres").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StockFormProps {
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  currentPrice?: number;
  isLoading?: boolean;
}

export const StockForm: React.FC<StockFormProps> = ({
  initialValues,
  onSubmit,
  currentPrice,
  isLoading = false
}) => {
  // Valores padrão para o formulário
  const defaultValues: FormValues = {
    ticker: '',
    quantity: 0,
    targetPercentage: 0,
    userRecommendation: 'Comprar',
    precoTetoUsuario: undefined,
    precoMedioCompra: undefined,
    notasFundamentos: '',
  };

  // Configuração do formulário com React Hook Form e Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || defaultValues,
  });

  // Estado para os campos estendidos
  const [precoTetoUsuario, setPrecoTetoUsuario] = useState<number | undefined>(
    initialValues?.precoTetoUsuario
  );
  const [precoMedioCompra, setPrecoMedioCompra] = useState<number | undefined>(
    initialValues?.precoMedioCompra
  );
  const [notasFundamentos, setNotasFundamentos] = useState<string>(
    initialValues?.notasFundamentos || ''
  );

  // Atualiza o formulário quando os campos estendidos mudam
  useEffect(() => {
    form.setValue('precoTetoUsuario', precoTetoUsuario);
    form.setValue('precoMedioCompra', precoMedioCompra);
    form.setValue('notasFundamentos', notasFundamentos);
  }, [precoTetoUsuario, precoMedioCompra, notasFundamentos, form]);

  // Função de submissão do formulário
  const handleSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      precoTetoUsuario,
      precoMedioCompra,
      notasFundamentos,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="ticker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticker</FormLabel>
              <FormControl>
                <Input placeholder="AAPL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percentual Meta (%)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userRecommendation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sua Recomendação</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma recomendação" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Comprar">Comprar</SelectItem>
                  <SelectItem value="Aguardar">Aguardar</SelectItem>
                  <SelectItem value="Vender">Vender</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos estendidos com ocultação progressiva */}
        <StockFormExtendedFields
          precoTetoUsuario={precoTetoUsuario}
          setPrecoTetoUsuario={setPrecoTetoUsuario}
          precoMedioCompra={precoMedioCompra}
          setPrecoMedioCompra={setPrecoMedioCompra}
          notasFundamentos={notasFundamentos}
          setNotasFundamentos={setNotasFundamentos}
          currentPrice={currentPrice}
          initiallyExpanded={!!initialValues?.precoTetoUsuario || !!initialValues?.precoMedioCompra || !!initialValues?.notasFundamentos}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
};

export default StockForm;
