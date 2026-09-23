"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/orbit/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
	organizationSchema,
	type OrganizationFormValues,
} from "@/schemas/auth.schema";
import { createOrganizationService } from "@/services/organization.service";
import { cnpjMask } from "@/utils/cnpjMask";

export default function CreateOrganizationPage() {
	const router = useRouter();
	const { refreshUser } = useAuth();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<OrganizationFormValues>({
		resolver: zodResolver(organizationSchema),
		defaultValues: {
			name: "",
			document: "",
			email: "",
		},
	});

	async function onSubmit(values: OrganizationFormValues) {
		setError(null);

		try {
			await createOrganizationService(values);
			await refreshUser();
			router.replace("/dashboard");
		} catch (submitError) {
			if (axios.isAxiosError(submitError)) {
				setError(
					submitError.response?.data?.message ??
						"Não foi possível criar a organização. Tente novamente.",
				);
				return;
			}

			setError("Não foi possível criar a organização. Tente novamente.");
		}
	}

	return (
		<div>
			<PageHeader
				eyebrow="Organização"
				title="Criar organização"
				description="Cadastre os dados da organização para começar a organizar sua operação no RewindJ."
				action={
					<Button asChild variant="outline">
						<Link href="/profile">
							<ArrowLeft />
							Voltar ao perfil
						</Link>
					</Button>
				}
			/>

			<Card className="orbit-shell overflow-hidden">
				<CardContent className="p-5 sm:p-6">
					<div className="mb-6 flex items-center gap-3">
						<div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
							<Building2 className="size-6 text-primary" />
						</div>

						<div>
							<h2 className="text-xl font-semibold tracking-normal">
								Dados da organização
							</h2>
							<p className="text-sm text-muted-foreground">
								Preencha os dados obrigatórios para continuar.
							</p>
						</div>
					</div>

					<Form {...form}>
						<form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome da organização</FormLabel>
										<FormControl>
											<Input placeholder="Nome da organização" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="document"
								render={({ field }) => (
									<FormItem>
										<FormLabel>CNPJ/documento</FormLabel>
										<FormControl>
											<Input
												placeholder="00.000.000/0000-00"
												inputMode="numeric"
												{...field}
												onChange={(event) =>
													field.onChange(cnpjMask(event.target.value))
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-mail</FormLabel>
										<FormControl>
											<Input
												type="email"
												autoComplete="email"
												placeholder="contato@organizacao.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{error ? (
								<p className="text-sm text-destructive">{error}</p>
							) : null}

							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="animate-spin" />
										Criando...
									</>
								) : (
									"Criar organização"
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
